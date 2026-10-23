import type { Game } from './game';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function changeStarter(game: Game, index: number): Game {
  const target = game.teamMembers[index];
  if (!target) return { ...game, notices: ['선택한 로스터 선수를 찾을 수 없습니다.'] };
  if (target.starter) return { ...game, notices: [`${target.nickname}은 이미 주전입니다.`] };
  const next = structuredClone(game);
  const active = next.teamMembers
    .map((member, memberIndex) => ({ member, memberIndex }))
    .filter((entry) => entry.member.starter);
  const benched = [...active].sort(
    (a, b) => a.member.form - b.member.form || a.member.skill - b.member.skill,
  )[0];
  if (benched) next.teamMembers[benched.memberIndex].starter = false;
  next.teamMembers[index].starter = true;
  next.stats.teamwork = clamp(next.stats.teamwork - 3);
  next.morale = clamp(next.morale - 1);
  next.history.unshift(`로스터 교체 · ${benched?.member.nickname ?? '기존 주전'} → ${target.nickname}`);
  next.notices = [`${target.nickname} 주전 등록 · 새 호흡 적응으로 팀워크 -3`];
  return next;
}
