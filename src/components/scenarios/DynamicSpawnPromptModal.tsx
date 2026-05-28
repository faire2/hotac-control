import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import {
  type DynamicSpawnHandler,
  type DynamicSpawnPrompt,
  type PromptValue,
  type DynamicSpawnDecision,
} from '../../data/scenarios/dynamicSpawnHandlers';

export interface PendingHandler {
  squadName: string;
  handler: DynamicSpawnHandler;
}

export interface HandlerOutcome {
  squadName: string;
  handlerKey: string;
  decision: DynamicSpawnDecision;
}

interface Props {
  show: boolean;
  pending: readonly PendingHandler[];
  onSubmit: (outcomes: readonly HandlerOutcome[]) => void;
  onCancel: () => void;
}

function defaultFor(prompt: DynamicSpawnPrompt): PromptValue {
  if (prompt.kind === 'confirm') return prompt.defaultValue ?? false;
  return prompt.defaultValue ?? prompt.min;
}

function initialInputs(pending: readonly PendingHandler[]): Record<string, Record<string, PromptValue>> {
  const out: Record<string, Record<string, PromptValue>> = {};
  for (const p of pending) {
    const fields: Record<string, PromptValue> = {};
    for (const prompt of p.handler.prompts) {
      fields[prompt.id] = defaultFor(prompt);
    }
    out[p.squadName] = fields;
  }
  return out;
}

export function DynamicSpawnPromptModal({ show, pending, onSubmit, onCancel }: Props) {
  // "Adjust state during render" pattern — see React docs at
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  //
  // The setState calls below schedule a re-render with fresh inputs, but
  // the *current* render still uses the stale `inputs` value. We compute
  // `effectiveInputs` locally so this render doesn't crash dereferencing
  // a freshly-added squad name that the old `inputs` map doesn't have.
  const [seenPending, setSeenPending] = useState(pending);
  const [inputs, setInputs] = useState<Record<string, Record<string, PromptValue>>>(() =>
    initialInputs(pending),
  );
  let effectiveInputs = inputs;
  if (seenPending !== pending) {
    effectiveInputs = initialInputs(pending);
    setSeenPending(pending);
    setInputs(effectiveInputs);
  }

  function setField(squadName: string, fieldId: string, value: PromptValue) {
    setInputs((prev) => ({
      ...prev,
      [squadName]: { ...prev[squadName], [fieldId]: value },
    }));
  }

  function handleConfirm() {
    const outcomes: HandlerOutcome[] = pending.map((p) => ({
      squadName: p.squadName,
      handlerKey: p.handler.key,
      decision: p.handler.decide(effectiveInputs[p.squadName] ?? {}),
    }));
    onSubmit(outcomes);
  }

  return (
    <Modal show={show} onHide={onCancel} centered scrollable size="lg">
      <Modal.Header closeButton className="scenarioModalHeader">
        <Modal.Title>End of round — events</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small">
          Confirm any in-game events that occurred this round. Imperial
          reinforcements will spawn based on your answers.
        </p>
        {pending.length === 0 ? (
          <em>No mission-specific events to resolve this round.</em>
        ) : null}
        {pending.map((p) => (
          <div key={p.squadName} className="mb-3 pb-2 border-bottom">
            <h5 className="mb-1">{p.handler.title}</h5>
            <div className="text-muted small mb-2">Squad: {p.squadName}</div>
            {p.handler.prompts.map((prompt) => {
              const value = effectiveInputs[p.squadName]?.[prompt.id];
              if (prompt.kind === 'confirm') {
                return (
                  <label key={prompt.id} className="d-block">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={value === true}
                      onChange={(e) => { setField(p.squadName, prompt.id, e.target.checked); }}
                    />
                    {prompt.label}
                  </label>
                );
              }
              return (
                <div key={prompt.id} className="form-group mb-2">
                  <label className="d-block mb-1">{prompt.label}</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ maxWidth: 120 }}
                    min={prompt.min}
                    max={prompt.max}
                    value={typeof value === 'number' ? value : prompt.min}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const clamped = Math.min(prompt.max, Math.max(prompt.min, Number.isFinite(n) ? n : prompt.min));
                      setField(p.squadName, prompt.id, clamped);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={handleConfirm}>
          Confirm &amp; advance
        </button>
      </Modal.Footer>
    </Modal>
  );
}
