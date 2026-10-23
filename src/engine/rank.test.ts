import { describe, expect, it } from 'vitest';
import { nextRankStep, rankLabel, softResetRp } from './rank';

describe('official rank divisions', () => {
  it('maps 2,296 RP to Silver 1 and the 2,400 RP Gold threshold', () => {
    expect(rankLabel(2296)).toBe('실버 1');
    expect(nextRankStep(2296)).toEqual({ min: 2400, label: '골드 4' });
  });

  it('uses every published division boundary through Mithril', () => {
    expect(rankLabel(0)).toBe('아이언 4');
    expect(rankLabel(600)).toBe('브론즈 4');
    expect(rankLabel(1400)).toBe('실버 4');
    expect(rankLabel(2150)).toBe('실버 1');
    expect(rankLabel(2400)).toBe('골드 4');
    expect(rankLabel(7600)).toBe('미스릴');
  });
});

describe('official rank score table', () => {
  it('adds survival, elimination, normal down, prevention down and terminate scores', async () => {
    const { rankScoreFor } = await import('./rank');
    expect(rankScoreFor(1, 2, 1, 1, 1)).toBe(71);
    expect(rankScoreFor(2, 1, 1, 0, 0)).toBe(39);
    expect(rankScoreFor(8, 1, 1, 0, 0)).toBe(6);
  });
});

describe('fan-game rank progression', () => {
  it('retains more low-tier RP during the soft reset', () => {
    expect(softResetRp(2000)).toBe(1920);
    expect(softResetRp(3000)).toBe(2790);
    expect(softResetRp(8000)).toBe(7040);
  });
});
