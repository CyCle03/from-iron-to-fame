import type { Game } from './game';

export type SeasonRecapView = {
  preResetRp: number;
  resetApplied: boolean;
  winRate: number;
  top3Rate: number;
  seasonEventCount: number;
  pendingCount: number;
};

const percentage = (value: number, total: number) => (total ? Math.round((value / total) * 1000) / 10 : 0);

export function buildSeasonRecapView(game: Game): SeasonRecapView | null {
  const summary = game.lastSeasonSummary;
  if (!summary) return null;
  const preResetRp = summary.rpBefore + summary.totalRp;
  const seasonEventCount = game.competitionHistory.reduce(
    (count, event) => count + Number(event.season === summary.season),
    0,
  );
  return {
    preResetRp,
    resetApplied: preResetRp !== summary.rpAfter,
    winRate: percentage(summary.wins, summary.matches),
    top3Rate: percentage(summary.top3, summary.matches),
    seasonEventCount,
    pendingCount: Number(game.turningPointAvailable) + game.scoutOffers.length + Number(seasonEventCount > 0),
  };
}
