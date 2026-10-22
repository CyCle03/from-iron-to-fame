import {describe, expect, it} from 'vitest';
import {CURRENT_SAVE_VERSION, createGame, validateGameState} from './game';
import {migrateGameSave} from './save';

describe('save migration', () => {
  it('rejects values that are not save objects', () => {
    expect(migrateGameSave(null)).toBeNull();
    expect(migrateGameSave('broken')).toBeNull();
  });

  it('upgrades an older save and fills new career fields', () => {
    const oldSave = createGame('이전 저장', '골드', '일반 유저', '유키') as unknown as Record<string, unknown>;
    oldSave.version = 1;
    delete oldSave.awards;
    delete oldSave.teamHistory;
    delete oldSave.experimentPool;

    const migrated = migrateGameSave(oldSave);

    expect(migrated?.version).toBe(CURRENT_SAVE_VERSION);
    expect(migrated?.awards).toEqual([]);
    expect(migrated?.experimentPool).toHaveLength(3);
    expect(migrated && validateGameState(migrated)).toEqual([]);
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
  });
});
