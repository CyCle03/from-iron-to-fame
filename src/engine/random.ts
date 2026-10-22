export type RandomSource = () => number;

export function randomChoice<T>(items: readonly T[], random: RandomSource = Math.random, exclude?: T): T {
  const candidates = exclude === undefined ? items : items.filter((item) => item !== exclude);
  const source = candidates.length ? candidates : items;
  if (!source.length) throw new Error('Cannot choose from an empty collection.');
  return source[Math.floor(random() * source.length)];
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
