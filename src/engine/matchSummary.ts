import type { Match } from './game';

export type MatchSummary = {
  games: number;
  averagePlace: number;
  averageTk: number;
  wins: number;
  top3: number;
  winRate: number;
  top3Rate: number;
  totalRp: number;
  placements: number[];
};

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

export function summarizeMatches(matches: Match[], limit = matches.length): MatchSummary {
  const sample = matches.slice(0, Math.max(0, limit));
  if (!sample.length)
    return {
      games: 0,
      averagePlace: 0,
      averageTk: 0,
      wins: 0,
      top3: 0,
      winRate: 0,
      top3Rate: 0,
      totalRp: 0,
      placements: [],
    };
  const wins = sample.filter((match) => match.place === 1).length;
  const top3 = sample.filter((match) => match.place <= 3).length;
  return {
    games: sample.length,
    averagePlace: oneDecimal(sample.reduce((sum, match) => sum + match.place, 0) / sample.length),
    averageTk: oneDecimal(sample.reduce((sum, match) => sum + (match.tk ?? match.kills), 0) / sample.length),
    wins,
    top3,
    winRate: oneDecimal((wins / sample.length) * 100),
    top3Rate: oneDecimal((top3 / sample.length) * 100),
    totalRp: sample.reduce((sum, match) => sum + match.rp, 0),
    placements: sample.map((match) => match.place),
  };
}
