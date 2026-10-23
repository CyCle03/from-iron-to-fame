import {
  finishMastersSeason,
  playCommunityCup,
  recordKelStage,
  recordMastersPhase,
  runSeason,
  type Action,
  type Game,
} from '../engine/game';
import { canEnterCommunityCup, canEnterMasters } from '../engine/careerRules';
import type { RandomSource } from '../engine/random';
import { simulateTournament, type TournamentResult } from '../engine/tournament';

export type SeasonAdvanceResult = {
  game: Game;
  tournamentResult: TournamentResult | null;
  tournamentEvents: number;
  report: string;
};

export function advanceCareerSeason(
  game: Game,
  action: Action,
  random: RandomSource = Math.random,
): SeasonAdvanceResult {
  let staged = game;
  let tournamentResult: TournamentResult | null = null;
  let tournamentEvents = 0;

  if (!canEnterMasters(staged)) {
    while (canEnterCommunityCup(staged)) {
      staged = playCommunityCup(staged, random);
      tournamentEvents++;
    }
  }

  if (staged.careerLeague === 'KEL') {
    while ((staged.kelStage ?? 0) < 7) {
      tournamentResult = simulateTournament(staged, 'kel', random);
      staged = recordKelStage(staged, tournamentResult.playerPlace);
      tournamentEvents++;
    }
  } else if (canEnterMasters(staged)) {
    while ((staged.mastersPhase ?? 0) < 3) {
      tournamentResult = simulateTournament(staged, 'masters', random);
      staged = recordMastersPhase(staged, tournamentResult.circuitPoints, tournamentResult.playerPlace);
      tournamentEvents++;
    }
    if (!staged.mastersSeason.champion) {
      staged = finishMastersSeason(staged);
      tournamentEvents += 2;
    }
  }

  const next = runSeason(staged, action, random);
  if (next.lastSeasonSummary) {
    next.lastSeasonSummary.tournamentEvents = tournamentEvents;
    next.lastSeasonSummary.fameGained = next.fame - game.fame;
  }

  return {
    game: next,
    tournamentResult,
    tournamentEvents,
    report: tournamentEvents ? `시즌 완료 · 공식 대회 ${tournamentEvents}개 일정 자동 진행` : next.history[0],
  };
}
