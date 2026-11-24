import { describe, expect, it } from 'vitest';
import {
  createGame,
  joinAmateurTeam,
  joinKel,
  recordKelStage,
  roleExperiments,
  validateGameState,
} from '../engine/game';
import { canJoinAmateurTeam, canJoinKel } from '../engine/careerRules';
import { createSeededRandom } from '../engine/random';
import { parseGameSave, serializeGameSave } from '../engine/save';
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

  it('reproduces the entire season flow with one seeded random source', () => {
    const before = createGame('재현 선수', '미스릴', '일반 유저', '유키');
    before.rp = 7600;

    const first = advanceCareerSeason(before, 'rank', createSeededRandom(20261023));
    const second = advanceCareerSeason(before, 'rank', createSeededRandom(20261023));

    expect(first).toEqual(second);
    expect(first.game.competitionHistory.length).toBeGreaterThan(0);
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

  it.each(['마스터즈', 'KEL'] as const)(
    'keeps a 30-season %s schedule equivalent across direct and saved resume paths',
    (startMode) => {
      const startCareer = () => {
        const random = createSeededRandom(20261125);
        let game = createGame('경로 동치', '데미갓', '일반 유저', '유키', undefined, undefined, random);
        if (startMode === 'KEL') {
          const teamName = 'KEL 시티 유나이티드';
          const benchRole = '서포터' as const;
          const benchExperiment =
            roleExperiments[benchRole].find((name) => !game.teammateExperiments.includes(name)) ?? '아야';
          game.careerLeague = 'KEL';
          game.teamName = teamName;
          game.contract = { team: teamName, league: 'KEL', salary: 950, seasonsRemaining: 3 };
          game.teamHistory = [teamName];
          game.kelRosterSize = 4;
          game.fame = 60;
          game.mastersPoints = 600;
          game.teammateExperiments = [...game.teammateExperiments, benchExperiment];
          game.teammateRoles = [...game.teammateRoles, benchRole];
          game.teamMembers = [
            ...game.teamMembers,
            {
              nickname: '루미아 후보',
              experiment: benchExperiment,
              role: benchRole,
              skill: 48,
              form: 55,
              fatigue: 8,
              starter: false,
            },
          ];
          game = recordKelStage(game, 3);
          expect(game.careerLeague).toBe('KEL');
          expect(game.contract?.league).toBe('KEL');
          expect(game.kelRosterSize).toBe(4);
        } else {
          game.fame = 20;
          game = joinAmateurTeam(game, random);
          game.competitionHistory = [{ season: 0, kind: '시즌 파이널', stage: 1, place: 0, points: 0 }];
        }
        return { game, random };
      };

      const drive = (resumeEachSeason: boolean) => {
        const start = startCareer();
        let game = start.game;
        const random = start.random;
        let tournamentEvents = 0;
        const kinds = new Set<string>();

        for (let season = 0; season < 30; season++) {
          if (!game.teamName && canJoinAmateurTeam(game)) game = joinAmateurTeam(game, random);
          if (canJoinKel(game)) game = joinKel(game, random);
          const seasonBefore = game.season;
          const result = advanceCareerSeason(game, game.careerLeague === 'KEL' ? 'team' : 'rank', random);
          game = result.game;
          tournamentEvents += result.tournamentEvents;
          for (const record of game.competitionHistory) {
            if (record.season >= 11) kinds.add(record.kind);
          }

          expect(game.season).toBe(seasonBefore + 1);
          expect(validateGameState(game)).toEqual([]);
          if (result.tournamentEvents > 0) {
            expect(game.lastSeasonSummary?.tournamentEvents).toBe(result.tournamentEvents);
            expect(result.report).toContain('공식 대회');
          }

          if (resumeEachSeason) {
            const resumed = parseGameSave(serializeGameSave(game));
            expect(resumed).not.toBeNull();
            expect(resumed && validateGameState(resumed)).toEqual([]);
            game = resumed ?? game;
          }
        }

        return { game, tournamentEvents, kinds };
      };

      const direct = drive(false);
      const resumed = drive(true);

      expect(direct.game).toEqual(resumed.game);
      expect(direct.tournamentEvents).toBeGreaterThan(0);
      expect(resumed.tournamentEvents).toBe(direct.tournamentEvents);
      if (startMode === 'KEL') {
        expect(direct.kinds.has('KEL')).toBe(true);
      } else {
        expect([...direct.kinds]).toEqual(expect.arrayContaining(['마스터즈', 'LCQ', '시즌 파이널']));
      }
      expect(parseGameSave(serializeGameSave(direct.game))).toEqual(direct.game);
    },
    30000,
  );
});
