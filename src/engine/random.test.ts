import { describe, expect, it } from 'vitest';
import { createSeededRandom, randomChoice } from './random';

describe('random utilities', () => {
  it('selects reproducibly and can exclude the current value', () => {
    expect(randomChoice(['a', 'b', 'c'], createSeededRandom(7))).toBe(
      randomChoice(['a', 'b', 'c'], createSeededRandom(7)),
    );
    expect(randomChoice(['a', 'b'], () => 0, 'a')).toBe('b');
  });

  it('rejects an empty collection', () => {
    expect(() => randomChoice([], () => 0)).toThrow('empty collection');
  });
});
