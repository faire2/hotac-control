import type { Scenario } from './types';
import { localTrouble } from './localTrouble';
import { captureOfficer1 } from './captureOfficer1';
import { captureOfficer2 } from './captureOfficer2';
import { captureOfficer3 } from './captureOfficer3';
import { refuelingStation1 } from './refuelingStation1';
import { refuelingStation2 } from './refuelingStation2';
import { refuelingStation3 } from './refuelingStation3';
import { minefields1 } from './minefields1';
import { minefields2 } from './minefields2';
import { minefields3 } from './minefields3';
import { chasingPhantoms1 } from './chasingPhantoms1';
import { chasingPhantoms2 } from './chasingPhantoms2';
import { chasingPhantoms3 } from './chasingPhantoms3';
import { chasingPhantoms4 } from './chasingPhantoms4';
import { defection1 } from './defection1';
import { defection2 } from './defection2';
import { defection3 } from './defection3';

export const SCENARIOS: readonly Scenario[] = Object.freeze([
  localTrouble,
  captureOfficer1,
  captureOfficer2,
  captureOfficer3,
  refuelingStation1,
  refuelingStation2,
  refuelingStation3,
  minefields1,
  minefields2,
  minefields3,
  chasingPhantoms1,
  chasingPhantoms2,
  chasingPhantoms3,
  chasingPhantoms4,
  defection1,
  defection2,
  defection3,
]);

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export type {
  Scenario,
  ScenarioSquad,
  SetupOp,
  ArrivalTrigger,
  Vector,
  Territory,
  Outcome,
  OutcomeNext,
  SpecialRule,
  CampaignArc,
  Campaign,
  CampaignSummary,
  CampaignHistoryEntry,
  DeckEntry,
} from './types';
export { resolveSquad, summarizeSquad } from './resolve';
export type { ResolvedSquad, ResolveContext } from './resolve';
