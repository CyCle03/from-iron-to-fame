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
