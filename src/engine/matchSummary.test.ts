import { describe, expect, it } from 'vitest';
import { summarizeMatches } from './matchSummary';

describe('match summaries', () => {
  it('builds DAK.GG-style aggregate metrics from the latest games', () => {
    const summary = summarizeMatches([
      { place: 1, kills: 3, tk: 12, rp: 70, name: '유키' },
      { place: 5, kills: 1, tk: 6, rp: -10, name: '유키' },
    ]);
    expect(summary).toMatchObject({ games: 2, averagePlace: 3, averageTk: 9, wins: 1, top3: 1, totalRp: 60 });
    expect(summary.winRate).toBe(50);
    expect(summary.top3Rate).toBe(50);
  });
});
