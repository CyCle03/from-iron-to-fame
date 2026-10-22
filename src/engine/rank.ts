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

export const rankFor = (rp: number): Rank =>
  [...RANK_BANDS].reverse().find((band) => rp >= band.min)?.rank ?? '아이언';

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
