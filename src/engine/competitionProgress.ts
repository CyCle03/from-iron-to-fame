import { COMPETITION_RP } from './competitionRules';
import type { Game } from './game';
import type { RandomSource } from './random';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function recordKelStage(game: Game, place: number): Game {
  if (game.careerLeague !== 'KEL')
    return { ...game, notices: ['KEL 일정은 KEL 4인 로스터 등록 후 참가할 수 있습니다.'] };
  if ((game.kelStage ?? 0) >= 7) return { ...game, notices: ['이번 KEL 시즌 일정을 모두 완료했습니다.'] };
  const next = structuredClone(game);
  next.kelStage = (next.kelStage ?? 0) + 1;
  if (place === 1) {
    next.trophies = (next.trophies ?? 0) + 1;
    next.awards = [`S${next.season} KEL ${next.kelStage}차 일정 MVP`, ...next.awards];
  }
  next.fame = clamp((next.fame ?? 0) + (place === 1 ? 8 : place <= 3 ? 6 : place <= 8 ? 4 : 2));
  next.credits += Math.max(100, 350 - place * 25);
  next.competitionHistory = [
    { season: next.season, kind: 'KEL', stage: next.kelStage, place, points: 0 },
    ...(next.competitionHistory ?? []),
  ];
  next.history.unshift(`KEL 일정 ${next.kelStage} 완료 · ${place}위`);
  next.notices = ['KEL 일정이 진행되었습니다. 다음 일정이 열렸습니다.'];
  return next;
}

export function playCommunityCup(game: Game, random: RandomSource = Math.random): Game {
  if ((game.seasonCupEntries ?? 0) >= 2)
    return { ...game, notices: ['이번 시즌 대통령배 KeG 일정을 모두 마쳤습니다.'] };
  if (game.rp < COMPETITION_RP.nationalAmateur)
    return { ...game, notices: ['전국 아마추어 대회는 미스릴 이상부터 자동 참가합니다.'] };
  const next = structuredClone(game);
  const eventName = next.seasonCupEntries === 0 ? '대통령배 KeG 지역대표선발전' : '대통령배 KeG 전국결선';
  const power =
    (next.stats.combat + next.stats.macro + next.stats.teamwork + next.stats.focus) / 4 +
    (next.mastery[next.main] ?? 0) * 0.2 +
    (random() - 0.5) * 24;
  const place = Math.max(1, Math.min(8, Math.round(9 - power / 9)));
  const fame = place === 1 ? 8 : place <= 3 ? 5 : place <= 5 ? 3 : 1;
  next.fame = clamp((next.fame ?? 0) + fame);
  next.communityCups = (next.communityCups ?? 0) + 1;
  next.seasonCupEntries = (next.seasonCupEntries ?? 0) + 1;
  next.competitionHistory = [
    { season: next.season, kind: '지역 컵', stage: next.seasonCupEntries, place, points: 0 },
    ...(next.competitionHistory ?? []),
  ];
  next.credits += fame * 18;
  next.history.unshift(`${eventName} ${place}위 · 인지도 +${fame}`);
  next.notices = [`${eventName} ${place}위! 인지도 +${fame}`];
  return next;
}
