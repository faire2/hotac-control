import Modal from 'react-bootstrap/Modal';
import { useEffect, useMemo, useState } from 'react';
import { MAIN_CAMPAIGN_ARCS } from '../../data/campaigns';
import { newCampaign } from '../../data/campaigns/factory';
import { campaignStore } from '../../data/campaigns/storage.active';
import { STANDARD_MODELS, ownsRequiredModels } from '../../data/campaigns/settings';
import { findScenario } from '../../data/scenarios';

interface Props {
  show: boolean;
  /** Called with the newly-created campaign's id. Caller transitions mode + closes. */
  onCreated: (campaignId: string) => void;
  onClose: () => void;
}

/**
 * Campaign setup form: name + intro toggle + owned models + less-random
 * mode + arc selection. On Save, builds a `Campaign` via `newCampaign()`,
 * persists via `campaignStore.save()`, and reports the new id back.
 *
 * Arcs whose `requiredModels` aren't all in `ownedModels` are auto-disabled
 * with a hint. The player can fix by checking the relevant model.
 */
export function CampaignSetupModal({ show, onCreated, onClose }: Props) {
  const [name, setName] = useState('');
  const [includeIntro, setIncludeIntro] = useState(true);
  const [ownedModels, setOwnedModels] = useState<readonly string[]>(STANDARD_MODELS);
  const [lessRandomShips, setLessRandomShips] = useState(false);
  const [freePickFromDeck, setFreePickFromDeck] = useState(false);
  const [includedArcIds, setIncludedArcIds] = useState<readonly string[]>(
    MAIN_CAMPAIGN_ARCS.map((a) => a.id),
  );

  // Reset to defaults each time the modal opens.
  useEffect(() => {
    if (show) {
      setName('');
      setIncludeIntro(true);
      setOwnedModels(STANDARD_MODELS);
      setLessRandomShips(false);
      setFreePickFromDeck(false);
      setIncludedArcIds(MAIN_CAMPAIGN_ARCS.map((a) => a.id));
    }
  }, [show]);

  // Required-models-per-arc, aggregated across every mission in the arc.
  // The head mission alone isn't enough — e.g., Minefields-1 has no
  // requirements but Minefields-2 needs GR-75 + VT-49.
  const arcRequirements = useMemo(() => {
    return new Map(
      MAIN_CAMPAIGN_ARCS.map((arc) => {
        const set = new Set<string>();
        for (const missionId of arc.missionIds) {
          const m = findScenario(missionId);
          if (m?.requiredModels) {
            for (const r of m.requiredModels) set.add(r);
          }
        }
        return [arc.id, Array.from(set)];
      }),
    );
  }, []);

  function isArcPlayable(arcId: string): boolean {
    return ownsRequiredModels(arcRequirements.get(arcId), ownedModels);
  }

  // Auto-uncheck any arc that becomes unplayable when an owned-model is dropped.
  useEffect(() => {
    setIncludedArcIds((current) => current.filter((id) => isArcPlayable(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isArcPlayable depends on ownedModels
  }, [ownedModels]);

  function toggleModel(model: string) {
    setOwnedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    );
  }

  function toggleArc(id: string) {
    setIncludedArcIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  const playableSelectedCount = includedArcIds.filter((id) => isArcPlayable(id)).length;
  const canSave = name.trim().length > 0 && (includeIntro || playableSelectedCount > 0);

  function handleSave() {
    if (!canSave) return;
    const campaign = newCampaign({
      name: name.trim(),
      includeIntro,
      ownedModels,
      lessRandomShips,
      freePickFromDeck,
      includedArcIds,
    });
    void campaignStore.save(campaign).then(() => {
      onCreated(campaign.id);
      onClose();
    });
  }

  return (
    <Modal show={show} onHide={onClose} centered scrollable size="lg">
      <Modal.Header closeButton>
        <Modal.Title>New campaign</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-group mb-3">
          <label htmlFor="campaign-name-input" className="d-block mb-1">Campaign name</label>
          <input
            id="campaign-name-input"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            placeholder="My Aturi Cluster Run"
          />
        </div>

        <div className="mb-3">
          <label className="d-inline-flex align-items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={includeIntro}
              onChange={(e) => { setIncludeIntro(e.target.checked); }}
            />
            Include the introductory mission (Local Trouble)
          </label>
        </div>

        <div className="mb-3">
          <label className="d-inline-flex align-items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={lessRandomShips}
              onChange={(e) => { setLessRandomShips(e.target.checked); }}
            />
            Less random ships (use 1d20 weighted table)
          </label>
        </div>

        <div className="mb-3">
          <label className="d-inline-flex align-items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={freePickFromDeck}
              onChange={(e) => { setFreePickFromDeck(e.target.checked); }}
            />
            Free pick from deck (instead of random draw)
          </label>
          <div className="text-muted small" style={{ marginLeft: '1.5rem' }}>
            Default: random draw faithful to printed rules. When checked, you
            see every arc head face-up between missions and pick whichever
            you like.
          </div>
        </div>

        <h5>Models I own</h5>
        <p className="text-muted small mb-2">
          Arcs requiring a model you don&apos;t own will be disabled below.
        </p>
        <div className="row mb-3">
          {STANDARD_MODELS.map((model) => (
            <div key={model} className="col-6 col-md-4">
              <label className="d-inline-flex align-items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={ownedModels.includes(model)}
                  onChange={() => { toggleModel(model); }}
                />
                {model}
              </label>
            </div>
          ))}
        </div>

        <h5>Arcs to include</h5>
        <p className="text-muted small mb-2">
          Heads of selected arcs go into the campaign deck. The intro is
          handled separately by the toggle above.
        </p>
        {MAIN_CAMPAIGN_ARCS.map((arc) => {
          const playable = isArcPlayable(arc.id);
          const required = arcRequirements.get(arc.id) ?? [];
          const missing = required.filter((r) => !ownedModels.some((o) => o.toLowerCase() === r.toLowerCase()));
          return (
            <div
              key={arc.id}
              className={`mb-1 ${playable ? '' : 'text-muted'}`}
              style={playable ? undefined : { opacity: 0.55 }}
            >
              <label className="d-inline-flex align-items-center mb-0">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={includedArcIds.includes(arc.id)}
                  disabled={!playable}
                  onChange={() => { toggleArc(arc.id); }}
                />
                <span className={playable ? '' : 'text-decoration-line-through'}>{arc.title}</span>
              </label>
              {!playable && missing.length > 0 ? (
                <div className="small text-danger" style={{ marginLeft: '1.5rem' }}>
                  Requires: {missing.join(', ')}
                </div>
              ) : null}
            </div>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          Create campaign
        </button>
      </Modal.Footer>
    </Modal>
  );
}
