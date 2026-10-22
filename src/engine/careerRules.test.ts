import {describe, expect, it} from 'vitest';
import {createGame, type Game} from './game';
import {
  canEnterCommunityCup,
  canEnterKelStage,
  canEnterMasters,
  canJoinAmateurTeam,
  canJoinKel,
} from './careerRules';

const career = (overrides: Partial<Game> = {}) => ({
  ...createGame('정책 테스트', '골드', '일반 유저', '유키'),
  ...overrides,
});

describe('career rules', () => {
  it('keeps tournament eligibility in pure selectors', () => {
    expect(canEnterCommunityCup(career({rp: 1200}))).toBe(true);
    expect(canEnterMasters(career({rp: 2400, fame: 75, teamName: '팀', careerLeague: '아마추어'}))).toBe(true);
    expect(canEnterKelStage(career({careerLeague: 'KEL', kelStage: 6}))).toBe(true);
  });

  it('reports team progression eligibility', () => {
    expect(canJoinAmateurTeam(career({fame: 45}))).toBe(true);
    expect(canJoinKel(career({fame: 180, mastersPoints: 400}))).toBe(true);
  });
});
