import type { Game } from './game';

export const CAREER_REQUIREMENTS = {
  communityCupRp: 1200,
  amateurTeamFame: 45,
  mastersRp: 2400,
  mastersFame: 75,
  kelFame: 180,
  kelMastersPoints: 400,
  hallOfFameFame: 500,
  hallOfFameTrophies: 3,
  hallOfFameRp: 6400,
} as const;

export const canEnterCommunityCup = (game: Game) =>
  game.rp >= CAREER_REQUIREMENTS.communityCupRp && game.seasonCupEntries < 2;

export const canEnterMasters = (game: Game) =>
  game.careerLeague !== '솔로' &&
  game.careerLeague !== 'KEL' &&
  game.rp >= CAREER_REQUIREMENTS.mastersRp &&
  game.fame >= CAREER_REQUIREMENTS.mastersFame &&
  game.mastersPhase < 3;

export const canEnterKelStage = (game: Game) => game.careerLeague === 'KEL' && game.kelStage < 7;

export const canJoinAmateurTeam = (game: Game) =>
  !game.teamName && game.fame >= CAREER_REQUIREMENTS.amateurTeamFame;

export const canJoinKel = (game: Game) =>
  game.fame >= CAREER_REQUIREMENTS.kelFame && game.mastersPoints >= CAREER_REQUIREMENTS.kelMastersPoints;

export const canPromoteTeamToKel = (game: Game) =>
  ['아마추어', '마스터즈'].includes(game.careerLeague) && game.fame >= 240 && game.mastersPoints >= 600;

export function nextCareerGoal(game: Game): { title: string; detail: string } {
  if (!game.teamName) {
    const fame = Math.max(0, CAREER_REQUIREMENTS.amateurTeamFame - game.fame);
    return {
      title: '아마추어 팀 합류',
      detail: fame ? `명성 ${fame} 필요` : '대회 화면에서 팀 제안을 수락하세요',
    };
  }
  if (game.careerLeague !== 'KEL') {
    const rp = Math.max(0, CAREER_REQUIREMENTS.mastersRp - game.rp);
    const fame = Math.max(0, CAREER_REQUIREMENTS.mastersFame - game.fame);
    if (rp || fame)
      return {
        title: '마스터즈 진출',
        detail: [`RP ${rp}`, `명성 ${fame}`].filter((value) => !value.endsWith(' 0')).join(' · ') + ' 필요',
      };
    return { title: '마스터즈 진출', detail: '시즌 센터에서 다음 페이즈에 참가하세요' };
  }
  if (!game.retired)
    return {
      title: '명예의 전당 도전',
      detail: `명성 ${Math.max(0, 500 - game.fame)} · 우승 ${Math.max(0, 3 - game.trophies)}회 필요`,
    };
  return { title: '커리어 기록 완성', detail: '명예의 전당 심사 조건을 확인하세요' };
}
