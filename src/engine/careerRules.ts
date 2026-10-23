import type { Game } from './game';
import { COMPETITION_RP } from './competitionRules';

export const CAREER_REQUIREMENTS = {
  communityCupRp: COMPETITION_RP.nationalAmateur,
  teamFormationRp: COMPETITION_RP.teamFormation,
  amateurTeamFame: 5,
  mastersRp: COMPETITION_RP.masters,
  mastersFame: 15,
  kelFame: 50,
  kelMastersPoints: 400,
  hallOfFameStarsFame: 60,
  hallOfFameHeroesMajorTitles: 3,
  hallOfFameHonorsFame: 90,
  hallOfFameHonorsMajorTitles: 5,
} as const;

export const canEnterCommunityCup = (game: Game) =>
  game.careerLeague !== 'KEL' &&
  game.rp >= CAREER_REQUIREMENTS.communityCupRp &&
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
  game.rp >= CAREER_REQUIREMENTS.mastersRp &&
  game.fame >= CAREER_REQUIREMENTS.mastersFame &&
  game.mastersPhase < 3;

export const canEnterKelStage = (game: Game) => game.careerLeague === 'KEL' && game.kelStage < 7;

export const canJoinAmateurTeam = (game: Game) =>
  !game.teamName &&
  game.rp >= CAREER_REQUIREMENTS.teamFormationRp &&
  game.fame >= CAREER_REQUIREMENTS.amateurTeamFame;

export const canJoinKel = (game: Game) =>
  game.fame >= CAREER_REQUIREMENTS.kelFame && game.mastersPoints >= CAREER_REQUIREMENTS.kelMastersPoints;

export const canPromoteTeamToKel = (game: Game) =>
  ['아마추어', '마스터즈'].includes(game.careerLeague) && game.fame >= 60 && game.mastersPoints >= 600;

export function nextCareerGoal(game: Game): { title: string; detail: string } {
  if (!game.teamName) {
    const rp = Math.max(0, CAREER_REQUIREMENTS.teamFormationRp - game.rp);
    const fame = Math.max(0, CAREER_REQUIREMENTS.amateurTeamFame - game.fame);
    return {
      title: '아마추어 팀 합류',
      detail:
        [rp ? '미스릴까지 ' + rp + ' RP' : '', fame ? '인지도 ' + fame : ''].filter(Boolean).join(' · ') ||
        '팀 화면에서 제안을 수락하세요',
    };
  }
  if (game.careerLeague !== 'KEL') {
    const rp = Math.max(0, CAREER_REQUIREMENTS.mastersRp - game.rp);
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
