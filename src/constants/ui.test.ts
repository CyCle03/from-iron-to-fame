import { describe, expect, it } from 'vitest';
import { SEASON_ACTIONS } from './ui';

describe('season action presentation', () => {
  it('describes every engine action with preview information', () => {
    expect(SEASON_ACTIONS).toHaveLength(7);
    expect(new Set(SEASON_ACTIONS.map((option) => option.id)).size).toBe(SEASON_ACTIONS.length);
    expect(SEASON_ACTIONS.every((option) => option.focus && option.load && option.rankedMatches > 0)).toBe(
      true,
    );
  });
});
