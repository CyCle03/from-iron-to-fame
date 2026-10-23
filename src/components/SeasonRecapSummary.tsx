import { rankLabel, type Game } from '../engine/game';

type Props = { game: Game; open: boolean; onClose: () => void };

export function SeasonRecapSummary({ game, open, onClose }: Props) {
  const summary = game.lastSeasonSummary;
  if (!open || !summary) return null;
  const preResetRp = summary.rpBefore + summary.totalRp;
  const resetApplied = preResetRp !== summary.rpAfter;
  const winRate = summary.matches ? Math.round((summary.wins / summary.matches) * 1000) / 10 : 0;
  const top3Rate = summary.matches ? Math.round((summary.top3 / summary.matches) * 1000) / 10 : 0;

  return (
    <div
      className="season-recap-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-recap-title"
    >
      <section className="season-recap season-recap-summary">
        <header>
          <p className="eyebrow">SEASON COMPLETE · S{summary.season} · 8팀 3인 스쿼드</p>
          <h2 id="season-recap-title">{game.name}의 시즌 성적표</h2>
          <button className="recap-close" onClick={onClose} aria-label="시즌 결산 닫기">
            ×
          </button>
        </header>
        <div className="recap-scoreboard">
          <span>
            <small>시작 티어</small>
            <b>{rankLabel(summary.rpBefore)}</b>
          </span>
          <span>
            <small>랭크 순변동</small>
            <b className={summary.totalRp >= 0 ? 'up' : 'down'}>
              {summary.totalRp >= 0 ? '+' : ''}
              {summary.totalRp} RP
            </b>
          </span>
          <span>
            <small>시즌 종료</small>
            <b>{rankLabel(summary.rpAfter)}</b>
          </span>
        </div>
        <div className="season-summary-grid">
          <span>
            <small>게임 수</small>
            <b>{summary.matches}</b>
          </span>
          <span>
            <small>평균 순위</small>
            <b>#{summary.averagePlace || '-'}</b>
          </span>
          <span>
            <small>평균 TK</small>
            <b>{summary.averageTk || '-'}</b>
          </span>
          <span>
            <small>승률</small>
            <b>{winRate}%</b>
          </span>
          <span>
            <small>TOP 3</small>
            <b>{top3Rate}%</b>
          </span>
          <span>
            <small>명성 획득</small>
            <b>+{summary.fameGained}</b>
          </span>
        </div>
        {resetApplied && (
          <p className="recap-reset">
            시즌 소프트 리셋 · {preResetRp.toLocaleString()} RP → {summary.rpAfter.toLocaleString()} RP
          </p>
        )}
        <div className="season-summary-note">
          <b>{summary.seasonCondition}</b>
          <span>
            {summary.conditionNote} · 자동 회복 {summary.autoRecoveryWeeks}회
          </span>
        </div>
        <footer className="recap-final recap-summary-final">
          <span>
            <small>최고 순위</small>
            <b>{summary.bestPlace ? `${summary.bestPlace}등` : '-'}</b>
          </span>
          <span>
            <small>공식 일정</small>
            <b>{summary.tournamentEvents}개</b>
          </span>
          <button onClick={onClose}>다음 시즌 준비</button>
        </footer>
      </section>
    </div>
  );
}
