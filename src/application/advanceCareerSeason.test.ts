import { describe, expect, it } from 'vitest';
import { createGame } from '../engine/game';
import { advanceCareerSeason } from './advanceCareerSeason';

describe('advanceCareerSeason', () => {
  it('advances an ineligible solo career without inventing tournament participation', () => {
    const before = createGame('신인', '플래티넘', '일반 유저', '유키');
    const result = advanceCareerSeason(before, 'rank');

    expect(result.game.season).toBe(before.season + 1);
    expect(result.tournamentEvents).toBe(0);
    expect(result.game.competitionHistory).toHaveLength(0);
    expect(before.season).not.toBe(result.game.season);
  });

  it('automatically completes the Masters schedule for an eligible team player', () => {
    const before = createGame('마스터', '데미갓', '피지컬 괴물', '아야');
    before.rp = 8400;
    before.fame = 20;
    before.teamName = '테스트 스쿼드';
    before.careerLeague = '마스터즈';

    const result = advanceCareerSeason(before, 'review');

    expect(result.tournamentEvents).toBe(5);
    expect(result.report).toContain('공식 대회 5개 일정 자동 진행');
    expect(result.game.competitionHistory.some((record) => record.kind === '마스터즈')).toBe(true);
    expect(result.game.season).toBe(before.season + 1);
  });
});
