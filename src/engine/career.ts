import type { CareerTotals, Game, HallOfFameCategory } from './game';

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

export const majorTitleCount = (game: Game) =>
  game.competitionHistory.filter(
    (record) =>
      record.place === 1 && (record.kind === '시즌 파이널' || (record.kind === 'KEL' && record.stage === 7)),
  ).length;

export const mvpCount = (game: Game) => game.awards.filter((award) => award.includes('MVP')).length;

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

export class HallOfFameCareer {
  constructor(private readonly game: Game) {}

  progress() {
    const game = this.game;
    const lastSeason = game.lastSeasonSummary?.season;
    const mastersAppearance = game.competitionHistory.some((record) =>
      ['마스터즈', 'LCQ', '시즌 파이널'].includes(record.kind),
    );
    const topTierPodium = game.competitionHistory.some(
      (record) =>
        record.season === lastSeason &&
        ['마스터즈', '시즌 파이널', 'KEL'].includes(record.kind) &&
        record.place > 0 &&
        record.place <= 3,
    );
    const topTierSeasons = new Set(
      game.competitionHistory
        .filter((record) => ['마스터즈', '시즌 파이널', 'KEL'].includes(record.kind))
        .map((record) => record.season),
    ).size;
    return {
      stars: {
        active: !game.retired,
        awareness: game.fame >= 70,
        mastersAppearance,
        topTierPodium,
        selectable: game.lastStarsSeason !== game.season,
      },
      heroes: {
        active: !game.retired,
        majorTitles: majorTitleCount(game) >= 3,
      },
      honors: {
        retired: game.retired,
        heroes: game.hallOfFameHonors.includes('히어로즈'),
        majorTitles: majorTitleCount(game) >= 5,
        mvps: mvpCount(game) >= 2,
        awareness: game.fame >= 90,
        longevity: topTierSeasons >= 5,
      },
    };
  }

  canReceive(category: HallOfFameCategory) {
    const progress = this.progress();
    if (category === '스타즈') return Object.values(progress.stars).every(Boolean);
    if (category === '히어로즈')
      return !this.game.hallOfFameHonors.includes(category) && Object.values(progress.heroes).every(Boolean);
    return !this.game.hallOfFameHonors.includes(category) && Object.values(progress.honors).every(Boolean);
  }
}

export const hallOfFameProgress = (game: Game) => new HallOfFameCareer(game).progress();

export const canReceiveHallHonor = (game: Game, category: HallOfFameCategory) =>
  new HallOfFameCareer(game).canReceive(category);

export function receiveHallHonor(game: Game, category: HallOfFameCategory): Game {
  if (!canReceiveHallHonor(game, category)) {
    return { ...game, notices: [`${category} 선정 조건이 아직 충족되지 않았습니다.`] };
  }
  const next = structuredClone(game);
  if (category === '스타즈') {
    next.starsSelections += 1;
    next.lastStarsSeason = next.season;
    next.awards.unshift(`S${next.season} e스포츠 명예의 전당 스타즈`);
  } else {
    next.hallOfFameHonors = [...new Set([...next.hallOfFameHonors, category])];
    if (category === '아너스') next.hallOfFame = true;
    next.awards.unshift(`e스포츠 명예의 전당 ${category}`);
  }
  next.history.unshift(`e스포츠 명예의 전당 ${category} 선정`);
  next.notices = [`e스포츠 명예의 전당 ${category}에 선정되었습니다!`];
  return next;
}

/** 이전 저장·호출부 호환: 최종 영구 헌액인 아너스 심사를 뜻한다. */
export const inductHallOfFame = (game: Game) => receiveHallHonor(game, '아너스');
