import { describe, expect, it } from 'vitest';
import { nextRankStep, rankLabel } from './rank';

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
