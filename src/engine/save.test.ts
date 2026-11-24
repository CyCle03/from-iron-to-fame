import { describe, expect, it } from 'vitest';
import { CURRENT_SAVE_VERSION, createGame, validateGameState } from './game';
import { getSavePreview, migrateGameSave, parseGameSave, serializeGameSave } from './save';

describe('save migration', () => {
  it('rejects values that are not save objects', () => {
    expect(migrateGameSave(null)).toBeNull();
    expect(migrateGameSave('broken')).toBeNull();
  });

  it('upgrades an older save and fills new career fields', () => {
    const oldSave = createGame('이전 저장', '골드', '일반 유저', '유키') as unknown as Record<
      string,
      unknown
    >;
    oldSave.version = 1;
    oldSave.fame = 2500;
    delete oldSave.awards;
    delete oldSave.teamHistory;
    delete oldSave.experimentPool;
    oldSave.lastSeasonSummary = {
      season: 11,
      plan: 'rank',
      rpBefore: 2400,
      rpAfter: 2500,
      rankBefore: '골드',
      rankAfter: '골드',
      fameGained: 4,
      matches: 4,
      bestPlace: 1,
      tournamentEvents: 0,
    };

    const migrated = migrateGameSave(oldSave);

    expect(migrated?.version).toBe(CURRENT_SAVE_VERSION);
    expect(migrated?.fame).toBe(4);
    expect(migrated?.awards).toEqual([]);
    expect(migrated?.experimentPool).toHaveLength(3);
    expect(migrated?.turningPointAvailable).toBe(false);
    expect(migrated?.lastSeasonSummary?.seasonCondition).toBe('균형 운영');
    expect(migrated?.lastSeasonSummary?.autoRecoveryWeeks).toBe(0);
    expect(migrated && validateGameState(migrated)).toEqual([]);
  });

  it('caps recognition by verified official competition history', () => {
    const base = createGame('인지도 검증', '플래티넘', '일반 유저', '유키');
    expect(migrateGameSave({ ...base, fame: 100 })?.fame).toBe(4);
    expect(
      migrateGameSave({
        ...base,
        fame: 100,
        competitionHistory: [{ season: 11, kind: '지역 컵', stage: 1, place: 1, points: 0 }],
      })?.fame,
    ).toBe(40);
  });

  it('filters malformed competition records without failing migration', () => {
    const base = createGame('손상 복구', '플래티넘', '일반 유저', '유키');
    const migrated = migrateGameSave({
      ...base,
      fame: 100,
      competitionHistory: [
        null,
        { kind: '가짜 대회', season: 11, stage: 1, place: 1, points: 0 },
        { kind: '마스터즈', season: '잘못됨', stage: 1, place: 1, points: 400 },
        { kind: '지역 컵', season: 11, stage: 1, place: 2, points: 0 },
      ],
    });

    expect(migrated?.competitionHistory).toEqual([
      { kind: '지역 컵', season: 11, stage: 1, place: 2, points: 0 },
    ]);
    expect(migrated?.fame).toBe(40);
  });

  it('repairs numeric fields that violate import state invariants', () => {
    const base = createGame('수치 복구', '골드', '일반 유저', '유키');
    const migrated = migrateGameSave({
      ...base,
      credits: -10,
      week: 999,
      rp: -50,
      stats: { ...base.stats, combat: 250, macro: Number.NaN },
      fatigue: -4,
      morale: 140,
      mastery: { ...base.mastery, [base.main]: 300 },
      actionPoints: -1,
      mastersPoints: -400,
      fame: 5000,
    });

    expect(migrated).not.toBeNull();
    expect(migrated && validateGameState(migrated)).toEqual([]);
    expect(migrated?.credits).toBe(0);
    expect(migrated?.week).toBe(12);
    expect(migrated?.rp).toBe(0);
    expect(migrated?.stats.combat).toBe(100);
    expect(migrated?.stats.macro).toBe(base.stats.macro);
    expect(migrated?.fatigue).toBe(0);
    expect(migrated?.morale).toBe(100);
    expect(migrated?.mastery[base.main]).toBe(100);
    expect(migrated?.actionPoints).toBe(0);
    expect(migrated?.mastersPoints).toBe(0);
    expect(migrated?.fame).toBe(4);

    const parsed = parseGameSave(JSON.stringify({ ...base, credits: -10, week: 999 }));
    expect(parsed?.credits).toBe(0);
    expect(parsed?.week).toBe(12);
    expect(parsed && validateGameState(parsed)).toEqual([]);
  });

  it('repairs duplicated experiment pools and invalid starting lineups on import', () => {
    const base = createGame('로스터 복구', '골드', '일반 유저', '유키');
    const pool = base.experimentPool;
    const migrated = migrateGameSave({
      ...base,
      experimentPool: [pool[0], pool[1], pool[1]],
      teamMembers: base.teamMembers.map((member) => ({ ...member, starter: false })),
    });

    expect(migrated).not.toBeNull();
    expect(migrated && validateGameState(migrated)).toEqual([]);
    const repairedPool = migrated?.experimentPool ?? [];
    expect(new Set(repairedPool).size).toBe(repairedPool.length);
    expect(migrated?.teamMembers.filter((member) => member.starter)).toHaveLength(2);
  });

  it('preserves a valid schema v7 save while enforcing invariants', () => {
    const game = createGame('현재 저장', '미스릴', '일반 유저', '유키');
    game.rp = 8765;
    game.credits = 4321;
    game.week = 12;
    game.fame = 40;
    game.fatigue = 7;
    game.morale = 63;
    game.stats = { ...game.stats, combat: 91 };
    game.mastery = { ...game.mastery, [game.main]: 55 };
    game.competitionHistory = [{ season: 11, kind: '지역 컵', stage: 1, place: 2, points: 0 }];
    game.history = ['기록 보존', ...game.history];
    game.notices = ['알림'];

    expect(validateGameState(game)).toEqual([]);
    expect(migrateGameSave(game)).toEqual(game);
  });

  it('repairs invalid profile choices without losing a valid name', () => {
    const migrated = migrateGameSave({
      name: '복구 선수',
      rank: '없는 티어',
      main: '없는 실험체',
      trainingFocus: ['존재하지 않는 능력치'],
    });

    expect(migrated?.name).toBe('복구 선수');
    expect(migrated?.rank).toBe('아이언');
    expect(migrated?.main).toBeTruthy();
    expect(migrated?.trainingFocus).toEqual(['physical', 'macro']);
    expect(migrated?.lastSeasonPlan).toBe('rank');
  });

  it('round-trips an exported save and rejects malformed JSON', () => {
    const game = createGame('백업 선수', '골드', '일반 유저', '유키');

    expect(parseGameSave(serializeGameSave(game))).toEqual(game);
    expect(parseGameSave('{broken')).toBeNull();
  });

  it('builds a safe summary before an imported save is applied', () => {
    const game = createGame('미리보기 선수', '골드', '일반 유저', '유키');

    expect(getSavePreview(game)).toEqual({
      name: '미리보기 선수',
      season: 11,
      rank: '골드',
      main: '유키',
      teamName: null,
      version: CURRENT_SAVE_VERSION,
    });
  });
});
