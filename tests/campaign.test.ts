import { describe, expect, it } from 'vitest';
import { applyOutcome, newCampaign, pickMission } from '../src/data/campaigns/factory';
import { MAIN_CAMPAIGN_ARCS, introduction } from '../src/data/campaigns';
import type { Outcome } from '../src/data/scenarios/types';
import type { ShipId } from '../src/data/Ships';

function dummyOutcome(
  next: Outcome['next'],
  rebelPoints = 0,
  imperialPoints = 0,
  unlocksShipTypes?: readonly ShipId[],
): Outcome {
  return { text: 'test', next, rebelPoints, imperialPoints, unlocksShipTypes };
}

describe('newCampaign', () => {
  it('starts with intro arc head when includeIntro is true', () => {
    const c = newCampaign({ name: 'Test', includeIntro: true });
    expect(c.deck).toHaveLength(1);
    expect(c.deck[0].arcId).toBe(introduction.id);
    expect(c.deck[0].headMissionId).toBe('local-trouble');
    expect(c.includeIntro).toBe(true);
    expect(c.status).toBe('active');
  });

  it('starts with all main arc heads when includeIntro is false', () => {
    const c = newCampaign({ name: 'Skip Intro', includeIntro: false });
    expect(c.deck).toHaveLength(MAIN_CAMPAIGN_ARCS.length);
    expect(c.deck.map((d) => d.arcId).sort()).toEqual(
      MAIN_CAMPAIGN_ARCS.map((a) => a.id).sort(),
    );
  });

  it('respects includedArcIds subset', () => {
    const c = newCampaign({
      name: 'Two Arcs',
      includeIntro: false,
      includedArcIds: ['capture-officer', 'minefields'],
    });
    expect(c.deck.map((d) => d.arcId).sort()).toEqual(['capture-officer', 'minefields']);
  });
});

describe('applyOutcome — deck mechanics', () => {
  it('arcLink advances the arc head', () => {
    const c = newCampaign({ name: 't', includeIntro: false });
    const outcome = dummyOutcome({ kind: 'arcLink', missionId: 'capture-officer-2' });
    const after = applyOutcome(c, 'capture-officer-1', 'victory', outcome);
    const co = after.deck.find((d) => d.arcId === 'capture-officer');
    expect(co?.headMissionId).toBe('capture-officer-2');
    // Other arcs unchanged.
    expect(after.deck.find((d) => d.arcId === 'minefields')?.headMissionId).toBe('minefields-1');
  });

  it('arcDiscard removes the arc from the deck and adds to completedArcs', () => {
    const c = newCampaign({ name: 't', includeIntro: false });
    const outcome = dummyOutcome({ kind: 'arcDiscard' }, 1);
    const after = applyOutcome(c, 'capture-officer-1', 'victory', outcome);
    expect(after.deck.find((d) => d.arcId === 'capture-officer')).toBeUndefined();
    expect(after.completedArcs).toContain('capture-officer');
    expect(after.rebelPoints).toBe(1);
    expect(after.status).toBe('active'); // other arcs still in deck
  });

  it('arcDiscard with last arc → rebel campaign victory', () => {
    let c = newCampaign({
      name: 't',
      includeIntro: false,
      includedArcIds: ['minefields'],
    });
    expect(c.deck).toHaveLength(1);
    c = applyOutcome(c, 'minefields-1', 'victory', dummyOutcome({ kind: 'arcDiscard' }, 1));
    expect(c.status).toBe('rebelVictory');
    expect(c.completedArcs).toEqual(['minefields']);
    expect(c.deck).toHaveLength(0);
  });

  it('reshuffle leaves the deck unchanged', () => {
    const c = newCampaign({ name: 't', includeIntro: false });
    const before = c.deck;
    const after = applyOutcome(c, 'capture-officer-1', 'defeat', dummyOutcome({ kind: 'reshuffle' }, 0, 1));
    expect(after.deck).toEqual(before);
    expect(after.imperialPoints).toBe(1);
  });

  it('campaignStart promotes intro to main deck', () => {
    let c = newCampaign({ name: 't', includeIntro: true });
    expect(c.deck.map((d) => d.arcId)).toEqual(['intro']);
    c = applyOutcome(c, 'local-trouble', 'victory', dummyOutcome({ kind: 'campaignStart' }));
    expect(c.deck.map((d) => d.arcId).sort()).toEqual(
      MAIN_CAMPAIGN_ARCS.map((a) => a.id).sort(),
    );
    expect(c.completedArcs).toContain('intro');
  });

  it('campaignEnd sets imperialVictory status', () => {
    const c = newCampaign({ name: 't', includeIntro: false });
    const after = applyOutcome(c, 'chasing-phantoms-4', 'defeat', dummyOutcome({ kind: 'campaignEnd' }, 0, 1));
    expect(after.status).toBe('imperialVictory');
    expect(after.imperialPoints).toBe(1);
  });

  it('replay leaves deck unchanged (intro defeat path)', () => {
    const c = newCampaign({ name: 't', includeIntro: true });
    const after = applyOutcome(c, 'local-trouble', 'defeat', dummyOutcome({ kind: 'replay' }));
    expect(after.deck).toEqual(c.deck);
  });

  it('introduces ship types declared on the outcome', () => {
    let c = newCampaign({ name: 't', includeIntro: false });
    c = applyOutcome(
      c,
      'chasing-phantoms-1',
      'victory',
      dummyOutcome({ kind: 'arcLink', missionId: 'chasing-phantoms-2' }, 0, 0, ['TIEPH']),
    );
    expect(c.introducedShipTypes).toContain('TIEPH');
    // An outcome without `unlocksShipTypes` does not introduce.
    c = applyOutcome(
      c,
      'defection-1',
      'defeat',
      dummyOutcome({ kind: 'reshuffle' }),
    );
    expect(c.introducedShipTypes).not.toContain('TIEDEF');
  });

  it('history rows accumulate with timestamp, points, and result', () => {
    let c = newCampaign({ name: 't', includeIntro: false });
    c = applyOutcome(c, 'capture-officer-1', 'victory', dummyOutcome({ kind: 'arcLink', missionId: 'capture-officer-2' }, 0));
    c = applyOutcome(c, 'capture-officer-2', 'defeat', dummyOutcome({ kind: 'reshuffle' }, 0, 1));
    expect(c.history).toHaveLength(2);
    expect(c.history[0].result).toBe('victory');
    expect(c.history[1].result).toBe('defeat');
    expect(c.history[1].imperialPoints).toBe(1);
  });
});

describe('pickMission', () => {
  it('sets currentMissionId and bumps updatedAt', () => {
    const c = newCampaign({ name: 't', includeIntro: false });
    const before = c.updatedAt;
    const after = pickMission(c, 'capture-officer-1');
    expect(after.currentMissionId).toBe('capture-officer-1');
    expect(after.updatedAt).toBeGreaterThanOrEqual(before);
  });
});
