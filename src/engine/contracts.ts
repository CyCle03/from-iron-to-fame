import type { Game } from './game';

export function renewContract(game: Game): Game {
  if (!game.contract || game.contract.seasonsRemaining > 1)
    return { ...game, notices: ['계약이 없거나 아직 재계약 협상 시기가 아닙니다.'] };
  const next = structuredClone(game);
  const contract = next.contract!;
  contract.seasonsRemaining = 2;
  contract.salary += 100;
  next.credits += 200;
  next.history.unshift(`재계약 · ${contract.team} · 2시즌 · 급여 ${contract.salary} C`);
  next.notices = ['재계약 완료 · 계약금 200 C'];
  return next;
}
