import { describe, expect, it } from 'vitest';
import { createGame, runSeason } from './game';
import { buildSeasonRecapView } from './seasonRecap';

describe('season recap view', () => {
  it('returns null before the first completed season', () => {
    expect(buildSeasonRecapView(createGame('신인', '아이언', '일반 유저', '유키'))).toBeNull();
  });

  it('derives rates, reset state and inbox counts once', () => {
    const base = { ...createGame('선수', '골드', '일반 유저', '유키'), fame: 200 };
    const game = runSeason(base, 'rank', () => 0.5);
    const view = buildSeasonRecapView(game);
    expect(view).not.toBeNull();
    expect(view?.winRate).toBeGreaterThanOrEqual(0);
    expect(view?.top3Rate).toBeGreaterThanOrEqual(view?.winRate ?? 0);
    expect(view?.pendingCount).toBeGreaterThan(0);
  });
});
