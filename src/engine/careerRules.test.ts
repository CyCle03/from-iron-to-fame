import { describe, expect, it } from 'vitest';
import { createGame, runSeason, type Game } from './game';
import {
  CAREER_REQUIREMENTS,
  KEL_SELECTION_LEGACY,
  canEnterCommunityCup,
  canEnterKelStage,
  canEnterMasters,
  canJoinAmateurTeam,
  canJoinKel,
  canPromoteTeamToKel,
  recentTopTierFinalPlace,
  seasonQualificationRp,
  nextCareerGoal,
  scoutOfferContext,
  starterSwapImpact,
} from './careerRules';

const career = (overrides: Partial<Game> = {}) => ({
  ...createGame('정책 테스트', '골드', '일반 유저', '유키'),
  ...overrides,
});

const withRecentFinal = (place: number, overrides: Partial<Game> = {}): Game => {
  const completed = runSeason(career(), 'review', () => 0.5);
  return {
    ...completed,
    fame: 50,
    mastersPoints: 400,
    competitionHistory: [
      {
        season: completed.lastSeasonSummary!.season,
        kind: '시즌 파이널',
        stage: 1,
        place,
        points: 0,
      },
    ],
    ...overrides,
  };
};

describe('career rules', () => {
  it('keeps tournament eligibility in pure selectors', () => {
    expect(canEnterCommunityCup(career({ rp: 7599 }))).toBe(false);
    expect(canEnterCommunityCup(career({ rp: 7600 }))).toBe(true);
    expect(canEnterCommunityCup(career({ rp: 7600, seasonCupEntries: 1 }))).toBe(false);
    expect(
      canEnterCommunityCup(
        career({
          rp: 7600,
          seasonCupEntries: 1,
          competitionHistory: [{ season: 11, kind: '지역 컵', stage: 1, place: 1, points: 0 }],
        }),
      ),
    ).toBe(true);
    expect(canEnterMasters(career({ rp: 8399, fame: 15, teamName: '팀', careerLeague: '아마추어' }))).toBe(
      false,
    );
    expect(canEnterMasters(career({ rp: 8400, fame: 15, teamName: '팀', careerLeague: '아마추어' }))).toBe(
      true,
    );
    expect(canEnterKelStage(career({ careerLeague: 'KEL', kelStage: 6 }))).toBe(true);
  });

  it('uses the pre-reset season rating for mid-season tournament qualification', () => {
    const completed = runSeason(career({ rp: 8400 }), 'review', () => 0.5);
    const resetPlayer = {
      ...completed,
      rp: 7300,
      lastSeasonSummary: { ...completed.lastSeasonSummary!, rpBefore: 8400, totalRp: 100 },
      fame: 15,
      teamName: '시즌 팀',
      careerLeague: '아마추어' as const,
    };

    expect(seasonQualificationRp(resetPlayer)).toBeGreaterThanOrEqual(8400);
    expect(canEnterMasters(resetPlayer)).toBe(true);
    expect(nextCareerGoal(resetPlayer).detail).toBe('다음 시즌 진행 시 자동 참가합니다');
  });

  it('reports team progression eligibility', () => {
    expect(canJoinAmateurTeam(career({ rp: 7599, fame: 5 }))).toBe(false);
    expect(canJoinAmateurTeam(career({ rp: 7600, fame: 5 }))).toBe(true);
    expect(canJoinKel(career({ fame: 50, mastersPoints: 400 }))).toBe(false);
    expect(canJoinKel(withRecentFinal(3))).toBe(true);
    expect(canPromoteTeamToKel(career({ fame: 60, mastersPoints: 600, careerLeague: '마스터즈' }))).toBe(
      false,
    );
    expect(
      canPromoteTeamToKel(withRecentFinal(3, { fame: 60, mastersPoints: 600, careerLeague: '마스터즈' })),
    ).toBe(true);
  });

  it('selects KEL from the most recent top-tier final result', () => {
    expect(CAREER_REQUIREMENTS.kelRecentFinalPlace).toBe(3);
    expect(recentTopTierFinalPlace(withRecentFinal(2))).toBe(2);
    expect(canJoinKel(withRecentFinal(4))).toBe(false);
    expect(canJoinKel(withRecentFinal(3))).toBe(true);
    expect(canJoinKel(withRecentFinal(3, { careerLeague: 'KEL' }))).toBe(false);
    const kelFinal = {
      ...withRecentFinal(4),
      competitionHistory: [{ season: 11, kind: 'KEL' as const, stage: 7, place: 2, points: 0 }],
    };
    expect(recentTopTierFinalPlace(kelFinal)).toBe(2);
    expect(canJoinKel(kelFinal)).toBe(true);
  });

  it('preserves the pre-change CP-only KEL baseline separately', () => {
    expect(KEL_SELECTION_LEGACY).toEqual({ ...CAREER_REQUIREMENTS, kelRecentFinalPlace: null });
    expect(canJoinKel(career({ fame: 50, mastersPoints: 400 }), KEL_SELECTION_LEGACY)).toBe(true);
    expect(
      canPromoteTeamToKel(
        career({ fame: 60, mastersPoints: 600, careerLeague: '마스터즈' }),
        KEL_SELECTION_LEGACY,
      ),
    ).toBe(true);
  });

  it('describes the next unmet career goal', () => {
    expect(nextCareerGoal(career({ rp: 7600, fame: 0 }))).toEqual({
      title: '아마추어 팀 합류',
      detail: '인지도 5',
    });
    expect(
      nextCareerGoal(career({ teamName: '테스트 팀', careerLeague: '아마추어', rp: 8300, fame: 70 })).detail,
    ).toContain('데미갓까지 100 RP');
  });

  it('derives comparable role, path and fit labels for scout offers', () => {
    expect(scoutOfferContext(career(), '아마추어').role).toContain('육성');
    expect(
      scoutOfferContext(
        career({
          stats: {
            physical: 80,
            combat: 80,
            macro: 80,
            judgement: 80,
            teamwork: 80,
            mental: 80,
            focus: 80,
            adaptability: 80,
          },
        }),
        'KEL',
      ).fit,
    ).toBe('즉시 전력');
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
