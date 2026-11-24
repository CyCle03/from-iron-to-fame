import type { Game } from './game';
import { COMPETITION_RP } from './competitionRules';

export type CareerRequirements = {
  readonly communityCupRp: number;
  readonly teamFormationRp: number;
  readonly amateurTeamFame: number;
  readonly mastersRp: number;
  readonly mastersFame: number;
  readonly kelFame: number;
  readonly kelMastersPoints: number;
  readonly kelRecentFinalPlace: number | null;
  readonly kelTeamPromotionFame: number;
  readonly kelTeamPromotionMastersPoints: number;
  readonly hallOfFameStarsFame: number;
  readonly hallOfFameHeroesMajorTitles: number;
  readonly hallOfFameHonorsFame: number;
  readonly hallOfFameHonorsMajorTitles: number;
  readonly hallOfFameHonorsMvps: number;
  readonly hallOfFameHonorsTopTierSeasons: number;
};

export const CAREER_REQUIREMENTS = {
  communityCupRp: COMPETITION_RP.nationalAmateur,
  teamFormationRp: COMPETITION_RP.teamFormation,
  amateurTeamFame: 5,
  mastersRp: COMPETITION_RP.masters,
  mastersFame: 15,
  kelFame: 50,
  kelMastersPoints: 400,
  kelRecentFinalPlace: 3,
  kelTeamPromotionFame: 60,
  kelTeamPromotionMastersPoints: 600,
  hallOfFameStarsFame: 70,
  hallOfFameHeroesMajorTitles: 3,
  hallOfFameHonorsFame: 90,
  hallOfFameHonorsMajorTitles: 5,
  hallOfFameHonorsMvps: 2,
  hallOfFameHonorsTopTierSeasons: 5,
} as const satisfies CareerRequirements;

/**
 * 2026-10-23 이전의 KEL 조건을 재현하는 비교 기준선.
 * 인지도와 누적 CP만 보며 최근 시즌 결승 성적은 요구하지 않는다.
 */
export const KEL_SELECTION_LEGACY = {
  ...CAREER_REQUIREMENTS,
  kelRecentFinalPlace: null,
} as const satisfies CareerRequirements;

export const seasonQualificationRp = (game: Game) => {
  const summary = game.lastSeasonSummary;
  const preResetRp = summary ? summary.rpBefore + (summary.totalRp ?? 0) : game.rp;
  return Math.max(game.rp, preResetRp);
};

export const canEnterCommunityCup = (game: Game) =>
  game.careerLeague !== 'KEL' &&
  seasonQualificationRp(game) >= CAREER_REQUIREMENTS.communityCupRp &&
  (game.seasonCupEntries === 0 ||
    (game.seasonCupEntries === 1 &&
      game.competitionHistory.some(
        (record) =>
          record.season === game.season &&
          record.kind === '지역 컵' &&
          record.stage === 1 &&
          record.place === 1,
      )));

export const canEnterMasters = (game: Game) =>
  game.careerLeague !== '솔로' &&
  game.careerLeague !== 'KEL' &&
  seasonQualificationRp(game) >= CAREER_REQUIREMENTS.mastersRp &&
  game.fame >= CAREER_REQUIREMENTS.mastersFame &&
  game.mastersPhase < 3;

export const canEnterKelStage = (game: Game) => game.careerLeague === 'KEL' && game.kelStage < 7;

export const canJoinAmateurTeam = (game: Game) =>
  !game.teamName &&
  seasonQualificationRp(game) >= CAREER_REQUIREMENTS.teamFormationRp &&
  game.fame >= CAREER_REQUIREMENTS.amateurTeamFame;

export const recentTopTierFinalPlace = (game: Game): number | null => {
  const season = game.lastSeasonSummary?.season ?? game.season - 1;
  if (season < 0) return null;
  const places = game.competitionHistory
    .filter(
      (record) =>
        record.season === season &&
        record.place > 0 &&
        (record.kind === '시즌 파이널' || (record.kind === 'KEL' && record.stage === 7)),
    )
    .map((record) => record.place);
  return places.length ? Math.min(...places) : null;
};

const meetsKelRecentFinalRequirement = (game: Game, requirements: CareerRequirements) => {
  if (requirements.kelRecentFinalPlace === null) return true;
  const recentFinalPlace = recentTopTierFinalPlace(game);
  return recentFinalPlace !== null && recentFinalPlace <= requirements.kelRecentFinalPlace;
};

export const kelSelectionRequirementLabel = (requirements: CareerRequirements = CAREER_REQUIREMENTS) =>
  [
    `인지도 ${requirements.kelFame}`,
    `마스터즈 CP ${requirements.kelMastersPoints}`,
    requirements.kelRecentFinalPlace === null
      ? null
      : `최근 시즌 결승 TOP${requirements.kelRecentFinalPlace}`,
  ]
    .filter((value): value is string => value !== null)
    .join(' · ');

export const kelTeamPromotionRequirementLabel = (requirements: CareerRequirements = CAREER_REQUIREMENTS) =>
  [
    `인지도 ${requirements.kelTeamPromotionFame}`,
    `마스터즈 CP ${requirements.kelTeamPromotionMastersPoints}`,
    requirements.kelRecentFinalPlace === null
      ? null
      : `최근 시즌 결승 TOP${requirements.kelRecentFinalPlace}`,
  ]
    .filter((value): value is string => value !== null)
    .join(' · ');

export const canJoinKel = (game: Game, requirements: CareerRequirements = CAREER_REQUIREMENTS) =>
  game.careerLeague !== 'KEL' &&
  game.fame >= requirements.kelFame &&
  game.mastersPoints >= requirements.kelMastersPoints &&
  meetsKelRecentFinalRequirement(game, requirements);

export const canPromoteTeamToKel = (game: Game, requirements: CareerRequirements = CAREER_REQUIREMENTS) =>
  ['아마추어', '마스터즈'].includes(game.careerLeague) &&
  game.fame >= requirements.kelTeamPromotionFame &&
  game.mastersPoints >= requirements.kelTeamPromotionMastersPoints &&
  meetsKelRecentFinalRequirement(game, requirements);

export function nextCareerGoal(game: Game): { title: string; detail: string } {
  const qualificationRp = seasonQualificationRp(game);
  if (!game.teamName) {
    const rp = Math.max(0, CAREER_REQUIREMENTS.teamFormationRp - qualificationRp);
    const fame = Math.max(0, CAREER_REQUIREMENTS.amateurTeamFame - game.fame);
    return {
      title: '아마추어 팀 합류',
      detail:
        [rp ? '미스릴까지 ' + rp + ' RP' : '', fame ? '인지도 ' + fame : ''].filter(Boolean).join(' · ') ||
        '팀 화면에서 제안을 수락하세요',
    };
  }
  if (game.careerLeague !== 'KEL') {
    const rp = Math.max(0, CAREER_REQUIREMENTS.mastersRp - qualificationRp);
    const fame = Math.max(0, CAREER_REQUIREMENTS.mastersFame - game.fame);
    if (rp || fame)
      return {
        title: '마스터즈 진출',
        detail:
          [rp ? '데미갓까지 ' + rp + ' RP' : '', fame ? '인지도 ' + fame : ''].filter(Boolean).join(' · ') +
          ' 필요',
      };
    return { title: '마스터즈 진출', detail: '다음 시즌 진행 시 자동 참가합니다' };
  }
  if (!game.retired)
    return {
      title: '명예의 전당 도전',
      detail: `히어로즈까지 메이저 우승 기록을 쌓으세요`,
    };
  return { title: '커리어 기록 완성', detail: '명예의 전당 심사 조건을 확인하세요' };
}

export function starterSwapImpact(game: Game, targetIndex: number) {
  const target = game.teamMembers[targetIndex];
  if (!target || target.starter) return null;
  const benched = game.teamMembers
    .filter((member) => member.starter)
    .sort((a, b) => a.form - b.form || a.skill - b.skill)[0];
  if (!benched) return null;
  return {
    benchedNickname: benched.nickname,
    powerChange: target.skill + target.form - (benched.skill + benched.form),
    teamworkChange: -3,
  };
}

export type ScoutOfferContext = {
  role: string;
  path: string;
  fit: '즉시 전력' | '적합' | '도전적' | '성장 필요' | '안정적';
};

export function scoutOfferContext(game: Game, league: Game['careerLeague']): ScoutOfferContext {
  const values = Object.values(game.stats);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (league === 'KEL')
    return {
      role: '4인 로스터 주전 경쟁',
      path: 'KEL 정규 일정·메이저 우승 도전',
      fit: average >= 68 ? '즉시 전력' : '도전적',
    };
  if (league === '마스터즈')
    return {
      role: '3인 스쿼드 핵심 로테이션',
      path: '서킷 포인트→시즌 파이널',
      fit: average >= 55 ? '적합' : '성장 필요',
    };
  return { role: '육성 로스터 주전', path: '전국대회→마스터즈 진출', fit: '안정적' };
}
