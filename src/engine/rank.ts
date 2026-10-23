import type { Rank } from './game';

const RANK_BANDS: { rank: Rank; min: number }[] = [
  { rank: '아이언', min: 0 },
  { rank: '브론즈', min: 600 },
  { rank: '실버', min: 1400 },
  { rank: '골드', min: 2400 },
  { rank: '플래티넘', min: 3600 },
  { rank: '다이아몬드', min: 5000 },
  { rank: '메테오라이트', min: 6400 },
  { rank: '미스릴', min: 7600 },
  { rank: '데미갓', min: 8400 },
  { rank: '이터니티', min: 9600 },
];

type DivisionBand = { min: number; label: string };
const DIVISION_BANDS: DivisionBand[] = [
  { min: 7600, label: '미스릴' },
  { min: 7300, label: '메테오라이트 1' },
  { min: 7000, label: '메테오라이트 2' },
  { min: 6700, label: '메테오라이트 3' },
  { min: 6400, label: '메테오라이트 4' },
  { min: 6050, label: '다이아몬드 1' },
  { min: 5700, label: '다이아몬드 2' },
  { min: 5350, label: '다이아몬드 3' },
  { min: 5000, label: '다이아몬드 4' },
  { min: 4650, label: '플래티넘 1' },
  { min: 4300, label: '플래티넘 2' },
  { min: 3950, label: '플래티넘 3' },
  { min: 3600, label: '플래티넘 4' },
  { min: 3300, label: '골드 1' },
  { min: 3000, label: '골드 2' },
  { min: 2700, label: '골드 3' },
  { min: 2400, label: '골드 4' },
  { min: 2150, label: '실버 1' },
  { min: 1900, label: '실버 2' },
  { min: 1650, label: '실버 3' },
  { min: 1400, label: '실버 4' },
  { min: 1200, label: '브론즈 1' },
  { min: 1000, label: '브론즈 2' },
  { min: 800, label: '브론즈 3' },
  { min: 600, label: '브론즈 4' },
  { min: 450, label: '아이언 1' },
  { min: 300, label: '아이언 2' },
  { min: 150, label: '아이언 3' },
  { min: 0, label: '아이언 4' },
];

export const rankFor = (rp: number): Rank =>
  [...RANK_BANDS].reverse().find((band) => rp >= band.min)?.rank ?? '아이언';

/** Official RP divisions through Mithril. Demigod/Eternity require live server standings and remain simulated. */
export const rankLabel = (rp: number) => DIVISION_BANDS.find((band) => rp >= band.min)?.label ?? '아이언 4';

export const nextRankStep = (rp: number) => {
  const ascending = [...DIVISION_BANDS].reverse();
  return ascending.find((band) => band.min > rp) ?? null;
};

export const startingRp = (rank: Rank) =>
  ({
    아이언: 120,
    브론즈: 720,
    실버: 1520,
    골드: 2520,
    플래티넘: 3720,
    다이아몬드: 5120,
    메테오라이트: 6520,
    미스릴: 7620,
    데미갓: 8400,
    이터니티: 9600,
  })[rank];

/** Fan-game soft reset: lower tiers retain more progress so early careers do not stall. */
export function softResetRp(rp: number): number {
  const rate = rp < 2400 ? 0.96 : rp < 5000 ? 0.93 : rp < 7600 ? 0.9 : 0.88;
  return Math.max(0, Math.floor(rp * rate));
}

/** Current official fee bands for 1/3-player premades. Top-rank cutoffs are simulated. */
export function rankEntryFee(rp: number): number {
  if (rp < 600) return 0;
  if (rp < 1400) return 10 + Math.min(3, Math.floor((rp - 600) / 200)) * 2;
  if (rp < 2400) return 18 + Math.min(3, Math.floor((rp - 1400) / 250)) * 2;
  if (rp < 3600) return 28 + Math.min(3, Math.floor((rp - 2400) / 300)) * 2;
  if (rp < 5000) return 36 + Math.min(3, Math.floor((rp - 3600) / 350)) * 2;
  if (rp < 6400) return 45 + Math.min(3, Math.floor((rp - 5000) / 350)) * 2;
  if (rp < 7600) return 53 + Math.min(3, Math.floor((rp - 6400) / 300));
  if (rp < 9600) return 58;
  return 58 + Math.floor((rp - 9600) / 250) * 2;
}

const SURVIVAL_POINTS = [40, 25, 20, 10, 5, 5, 0, 0];
const ELIMINATION_POINTS = [10, 9, 8, 7, 6, 6, 4, 4];
const DOWN_POINTS = [5, 4.5, 4, 3.5, 3, 3, 2, 2];

/**
 * Official rank score table for an eight-team squad match.
 * The simulator uses a 1.0 match-tier modifier because it has no live matchmaking average.
 */
export const rankScoreFor = (
  place: number,
  eliminations: number,
  normalDowns: number,
  preventionDowns: number,
  preventionTerminates: number,
  matchTierModifier = 1,
) => {
  const index = Math.max(0, Math.min(7, Math.floor(place) - 1));
  const score =
    SURVIVAL_POINTS[index] +
    eliminations * ELIMINATION_POINTS[index] * matchTierModifier +
    normalDowns * DOWN_POINTS[index] * matchTierModifier +
    preventionDowns * 3 * matchTierModifier +
    preventionTerminates * 3 * matchTierModifier;
  return Math.round(score);
};
