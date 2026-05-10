import Modal from 'react-bootstrap/Modal';
import { useEffect, useState } from 'react';
import type { CampaignSummary } from '../../data/scenarios/types';
import { campaignStore } from '../../data/campaigns/storage.active';

interface Props {
  show: boolean;
  onResume: (campaignId: string) => void;
  onClose: () => void;
}

const STATUS_LABEL: Record<CampaignSummary['status'], string> = {
  active: 'Active',
  rebelVictory: 'Rebel victory',
  imperialVictory: 'Imperial victory',
};

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString();
}

export function OpenCampaignModal({ show, onResume, onClose }: Props) {
  const [campaigns, setCampaigns] = useState<readonly CampaignSummary[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function refresh() {
    setLoading(true);
    void campaignStore.list().then((list) => {
      setCampaigns(list);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (show) refresh();
  }, [show]);

  function confirmDelete() {
    if (pendingDelete === null) return;
    void campaignStore.delete(pendingDelete).then(() => {
      setPendingDelete(null);
      refresh();
    });
  }

  return (
    <Modal show={show} onHide={onClose} centered scrollable size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Open campaign</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <em>Loading…</em>
        ) : campaigns.length === 0 ? (
          <em>No saved campaigns yet. Pick Menu → New → Campaign to start one.</em>
        ) : (
          <div className="d-flex flex-column">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="d-flex align-items-center mb-2 p-2 border rounded"
              >
                <div className="flex-grow-1">
                  <div className="font-weight-bold">{c.name}</div>
                  <div className="small text-muted">
                    {STATUS_LABEL[c.status]} ·
                    {' '}Rebel VP {c.rebelPoints.toString()} / Imperial VP {c.imperialPoints.toString()}
                    {' '}· {c.completedArcs.toString()}/{c.totalArcs.toString()} arcs done
                    {' '}· last played {formatTime(c.updatedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mr-2"
                  onClick={() => { onResume(c.id); onClose(); }}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => { setPendingDelete(c.id); }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {pendingDelete !== null && (
          <div className="alert alert-warning mt-3">
            <p className="mb-2">Delete this campaign? This can&apos;t be undone.</p>
            <button
              type="button"
              className="btn btn-danger btn-sm mr-2"
              onClick={confirmDelete}
            >
              Confirm delete
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setPendingDelete(null); }}
            >
              Cancel
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
