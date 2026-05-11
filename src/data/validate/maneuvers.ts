import { Ships, AI } from '../Ships';
import { PSN, MVRS } from '../Maneuvers';
import type { Position } from '../Maneuvers';
import { fgaManeuvers } from '../fga/Maneuvers';
import { andersonManeuvers } from '../anderson/Maneuvers';
import type { ValidationFailure } from './types';

const KNOWN_MANEUVERS = new Set<string>(Object.values(MVRS));
const KNOWN_POSITIONS = new Set<string>(Object.values(PSN));

type ManeuverTablesByShip = Record<string, Partial<Record<Position, readonly unknown[]>> | undefined>;

const FGA_REQUIRED_POSITIONS: readonly Position[] = [
  PSN.R4BULL,
  PSN.R4FRONT,
  PSN.R4FRONTSIDE,
  PSN.R4REARSIDE,
  PSN.R4REAR,
  PSN.R3BULL,
  PSN.R3FRONT,
  PSN.R3FRONTSIDE,
  PSN.R3REARSIDE,
  PSN.R3REAR,
  PSN.R1BULL,
  PSN.R1FRONT,
  PSN.R1FRONTSIDE,
  PSN.R1REARSIDE,
  PSN.R1REAR,
  PSN.STRSBULL,
  PSN.STRSFRONT,
  PSN.STRSFRONTSIDE,
  PSN.STRSREARSIDE,
  PSN.STRSREAR,
];

function checkManeuverTables(
  engine: string,
  tables: ManeuverTablesByShip,
  requiredPositions: readonly Position[],
  failures: ValidationFailure[],
): void {
  for (const [shipId, byPosition] of Object.entries(tables)) {
    if (!byPosition) continue;

    if (!(shipId in Ships)) {
      failures.push({
        rule: 'AI coverage',
        detail: `${engine} has a maneuver table for unknown shipId="${shipId}"`,
      });
      continue;
    }

    for (const position of requiredPositions) {
      const row = byPosition[position];
      if (!row) {
        failures.push({
          rule: 'Position coverage',
          detail: `${engine}.${shipId} missing required position "${position}"`,
        });
        continue;
      }
      if (row.length !== 6) {
        failures.push({
          rule: 'Length-6 maneuver arrays',
          detail: `${engine}.${shipId}["${position}"] has length ${row.length.toString()}, expected 6`,
        });
      }
      for (let i = 0; i < row.length; i++) {
        const code = row[i];
        if (typeof code !== 'string' || !KNOWN_MANEUVERS.has(code)) {
          failures.push({
            rule: 'Resolved maneuver references',
            detail: `${engine}.${shipId}["${position}"][${i.toString()}] = ${typeof code === 'string' ? code : String(code)} is not a known MVRS code`,
          });
        }
      }
    }

    for (const positionKey of Object.keys(byPosition)) {
      if (!KNOWN_POSITIONS.has(positionKey)) {
        failures.push({
          rule: 'Position keys exist in PSN',
          detail: `${engine}.${shipId} uses unknown position key "${positionKey}"`,
        });
      }
    }
  }
}

export function checkManeuvers(failures: ValidationFailure[]): void {
  checkManeuverTables('fga', fgaManeuvers, FGA_REQUIRED_POSITIONS, failures);
  // Anderson: validate the *shape* of every existing table.
  // Phase 5a tolerates missing entries; Phase 5b will tighten via checkAiCoverage.
  checkManeuverTables('anderson', andersonManeuvers, FGA_REQUIRED_POSITIONS, failures);
}

export function checkAiCoverage(failures: ValidationFailure[]): void {
  for (const ship of Object.values(Ships)) {
    for (const engine of ship.ai) {
      if (engine === AI.FGA) {
        if (!(ship.id in fgaManeuvers)) {
          failures.push({
            rule: 'AI coverage',
            detail: `Ships.${ship.id}.ai includes "${engine}" but no fgaManeuvers entry exists`,
          });
        }
      }
      // AI.ANDERSON coverage is phase-gated: Phase 5a tolerates missing maneuver
      // tables; Phase 5b will require them.
    }
  }
}
