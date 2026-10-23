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
