import { describe, expect, it } from 'vitest';
import { createGame, type Game } from './game';
import {
  canEnterCommunityCup,
  canEnterKelStage,
  canEnterMasters,
  canJoinAmateurTeam,
  canJoinKel,
  canPromoteTeamToKel,
  nextCareerGoal,
  starterSwapImpact,
} from './careerRules';

const career = (overrides: Partial<Game> = {}) => ({
  ...createGame('정책 테스트', '골드', '일반 유저', '유키'),
  ...overrides,
});

describe('career rules', () => {
  it('keeps tournament eligibility in pure selectors', () => {
    expect(canEnterCommunityCup(career({ rp: 1200 }))).toBe(true);
    expect(canEnterMasters(career({ rp: 2400, fame: 75, teamName: '팀', careerLeague: '아마추어' }))).toBe(
      true,
    );
    expect(canEnterKelStage(career({ careerLeague: 'KEL', kelStage: 6 }))).toBe(true);
  });

  it('reports team progression eligibility', () => {
    expect(canJoinAmateurTeam(career({ fame: 45 }))).toBe(true);
    expect(canJoinKel(career({ fame: 180, mastersPoints: 400 }))).toBe(true);
    expect(canPromoteTeamToKel(career({ fame: 240, mastersPoints: 600, careerLeague: '마스터즈' }))).toBe(
      true,
    );
  });

  it('describes the next unmet career goal', () => {
    expect(nextCareerGoal(career({ fame: 20 }))).toEqual({
      title: '아마추어 팀 합류',
      detail: '명성 25 필요',
    });
    expect(
      nextCareerGoal(career({ teamName: '테스트 팀', careerLeague: '아마추어', rp: 2300, fame: 70 })).detail,
    ).toContain('RP 100');
  });

  it('previews the same weakest-starter swap used by roster changes', () => {
    const game = career({ teamName: '테스트 팀' });
    game.teamMembers.push({
      nickname: '후보',
      experiment: '아야',
      role: '원거리 딜러',
      skill: 90,
      form: 80,
      fatigue: 0,
      starter: false,
    });
    const impact = starterSwapImpact(game, game.teamMembers.length - 1);
    expect(impact?.teamworkChange).toBe(-3);
    expect(impact?.powerChange).toBeGreaterThan(0);
  });
});
