import type { CareerTotals, Game } from './game';

export function careerTotals(game: Game): CareerTotals {
  const placed = game.competitionHistory.filter((record) => record.place > 0);
  const representative = Object.entries(game.mastery).sort((a, b) => b[1] - a[1])[0]?.[0] ?? game.main;
  return {
    events: game.competitionHistory.length,
    wins: placed.filter((record) => record.place === 1).length,
    podiums: placed.filter((record) => record.place <= 3).length,
    bestPlace: placed.length ? Math.min(...placed.map((record) => record.place)) : null,
    representative,
  };
}

export function retireCareer(game: Game): Game {
  if (game.retired) return game;
  const next = structuredClone(game);
  next.retired = true;
  next.retirementSeason = next.season;
  next.contract = null;
  next.scoutOffers = [];
  next.history.unshift(`S${next.season} 선수 은퇴 · 커리어 기록 보존`);
  next.notices = ['현역 커리어를 마치고 기록 보관소로 이동했습니다.'];
  return next;
}

export const hallOfFameProgress = (game: Game) => ({
  retired: game.retired,
  fame: game.fame >= 1500,
  trophies: game.trophies >= 3,
  kel: game.careerLeague === 'KEL' || game.teamHistory.some((team) => team.includes('KEL')),
  rank: game.rp >= 6400,
});

export function inductHallOfFame(game: Game): Game {
  if (!Object.values(hallOfFameProgress(game)).every(Boolean)) {
    return {
      ...game,
      notices: ['명예의 전당 조건: 은퇴 · 명성 1,500 · 우승 3회 · KEL 경력 · 메테오라이트 이상'],
    };
  }
  const next = structuredClone(game);
  next.hallOfFame = true;
  next.history.unshift('명예의 전당 헌액 · 루미아 섬에 이름을 남겼습니다.');
  next.notices = ['명예의 전당에 헌액되었습니다!'];
  return next;
}
