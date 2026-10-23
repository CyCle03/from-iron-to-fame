import { useEffect, useMemo, useState } from 'react';
import type { Game, Match } from '../engine/game';

type Props = { game: Game; open: boolean; onClose: () => void };

export function SeasonRecap({ game, open, onClose }: Props) {
  const summary = game.lastSeasonSummary;
  const matches = useMemo<Match[]>(
    () => (summary ? game.matches.slice(0, summary.matches).reverse() : []),
    [game.matches, summary],
  );
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (open) setRevealed(0);
  }, [open, summary?.season]);

  useEffect(() => {
    if (!open || revealed >= matches.length) return;
    const timer = window.setTimeout(() => setRevealed((value) => value + 1), 360);
    return () => window.clearTimeout(timer);
  }, [open, revealed, matches.length]);

  if (!open || !summary) return null;
  const visible = matches.slice(0, revealed);
  const net = visible.reduce((sum, match) => sum + match.rp, 0);
  const complete = revealed >= matches.length;
  const preResetRp = summary.rpBefore + matches.reduce((sum, match) => sum + match.rp, 0);
  const resetApplied = preResetRp !== summary.rpAfter;
  const progress = matches.length ? (revealed / matches.length) * 100 : 100;

  return (
    <div className="season-recap-backdrop" role="dialog" aria-modal="true" aria-labelledby="season-recap-title">
      <section className="season-recap">
        <header>
          <p className="eyebrow">SEASON COMPLETE · S{summary.season} · 8팀 3인 스쿼드</p>
          <h2 id="season-recap-title">{game.name}의 시즌 결산</h2>
          <button className="recap-close" onClick={onClose} aria-label="시즌 결산 닫기">×</button>
        </header>
        <div className="recap-scoreboard">
          <span><small>시작</small><b>{summary.rpBefore.toLocaleString()} RP</b></span>
          <span><small>현재 누적</small><b className={net >= 0 ? 'up' : 'down'}>{net >= 0 ? '+' : ''}{net} RP</b></span>
          <span><small>시즌 종료</small><b>{complete ? summary.rpAfter.toLocaleString() : (summary.rpBefore + net).toLocaleString()} RP</b></span>
        </div>
        <div className="recap-progress">
          <div><span>랭크 기록 재생</span><b>{revealed} / {matches.length}판</b></div>
          <i><i style={{ width: `${progress}%` }} /></i>
        </div>
        <div className="recap-match-list" aria-live="polite">
          {visible.map((match, index) => (
            <div className="recap-match" key={`${index}-${match.place}-${match.rp}`}>
              <b>{String(index + 1).padStart(2, '0')}경기</b>
              <span><strong>{match.place}등</strong> · {match.kills}킬</span>
              <small>입장료 {match.fee ?? 0} RP</small>
              <em className={match.rp >= 0 ? 'up' : 'down'}>{match.rp >= 0 ? '+' : ''}{match.rp} RP</em>
            </div>
          ))}
          {!matches.length && <p className="recap-empty">이번 시즌에는 랭크 경기가 없었습니다.</p>}
        </div>
        {complete ? (
          <>{resetApplied && <p className="recap-reset">시즌 소프트 리셋 · {preResetRp.toLocaleString()} RP → {summary.rpAfter.toLocaleString()} RP</p>}<footer className="recap-final">
            <span><small>최종 티어</small><b>{summary.rankBefore} → {summary.rankAfter}</b></span>
            <span><small>최고 순위</small><b>{summary.bestPlace ? `${summary.bestPlace}등` : '-'}</b></span>
            <span><small>명성</small><b>+{summary.fameGained}</b></span>
            <button onClick={onClose}>결산 확인</button>
          </footer></>
        ) : <button className="recap-skip" onClick={() => setRevealed(matches.length)}>빠르게 결과 보기</button>}
      </section>
    </div>
  );
}
