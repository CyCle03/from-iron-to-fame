import { summarizeMatches } from '../engine/matchSummary';
import type { Match } from '../engine/game';

type Props = {
  matches: Match[];
  title?: string;
  limit?: number;
  compact?: boolean;
};

export function RankSnapshot({ matches, title = '최근 랭크 요약', limit = 20, compact = false }: Props) {
  const summary = summarizeMatches(matches, limit);
  if (!summary.games) return null;
  return (
    <section className={`rank-snapshot panel${compact ? ' compact' : ''}`}>
      <div className="rank-snapshot-heading">
        <div>
          <p className="eyebrow">RANK SNAPSHOT</p>
          <h2>{title}</h2>
        </div>
        <b>{summary.games}게임</b>
      </div>
      <div className="rank-snapshot-stats">
        <span>
          <small>평균 순위</small>
          <b>#{summary.averagePlace}</b>
        </span>
        <span>
          <small>평균 TK</small>
          <b>{summary.averageTk}</b>
        </span>
        <span>
          <small>승률</small>
          <b>{summary.winRate}%</b>
        </span>
        <span>
          <small>TOP 3</small>
          <b>{summary.top3Rate}%</b>
        </span>
        <span>
          <small>총 RP 획득</small>
          <b className={summary.totalRp >= 0 ? 'up' : 'down'}>
            {summary.totalRp >= 0 ? '+' : ''}
            {summary.totalRp}
          </b>
        </span>
      </div>
      <div className="placement-strip" aria-label="최근 경기 순위">
        {summary.placements.map((place, index) => (
          <i key={`${index}-${place}`} className={place === 1 ? 'win' : place <= 3 ? 'top3' : ''}>
            {place}
          </i>
        ))}
      </div>
    </section>
  );
}
