import type { Game } from './game';
import type { RandomSource } from './random';
import { rankFor, softResetRp } from './rank';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function nextWeek(game: Game, random: RandomSource = Math.random): Game {
  const next = structuredClone(game);
  next.week++;
  if (next.week > 12) {
    const before = next.rp;
    next.week = 1;
    next.season++;
    next.rp = softResetRp(next.rp);
    next.rank = rankFor(next.rp);
    next.notices = [`시즌 ${next.season} 소프트 리셋 · ${before} RP → ${next.rp} RP`];
  } else {
    next.notices = [
      random() > 0.75
        ? '스카우트가 최근 경기 기록을 주목합니다.'
        : '다음 대회까지 랭크와 연습으로 기반을 다져보세요.',
    ];
  }
  next.actionPoints = 3;
  next.fatigue = clamp(next.fatigue - 8);
  return next;
}
