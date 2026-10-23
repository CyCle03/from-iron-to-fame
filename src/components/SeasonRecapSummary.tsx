import { useState } from 'react';
import { rankLabel, type Game } from '../engine/game';
import { buildSeasonRecapView } from '../engine/seasonRecap';

type Props = { game: Game; open: boolean; onClose: () => void };

export function SeasonRecapSummary({ game, open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const summary = game.lastSeasonSummary;
  const close = () => {
    setStep(0);
    onClose();
  };
  if (!open || !summary) return null;

  const view = buildSeasonRecapView(game)!;
  const title = step === 0 ? '시즌의 결론' : step === 1 ? '랭크 경기 리포트' : '다음 이야기가 도착했습니다';

  return (
    <div
      className="season-recap-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="season-recap-title"
    >
      <section className="season-recap season-recap-summary recap-story">
        <div className="recap-progress" aria-label={`${step + 1}/3 단계`}>
          {[0, 1, 2].map((item) => (
            <i key={item} className={item <= step ? 'active' : ''} />
          ))}
        </div>
        <header>
          <div>
            <p className="eyebrow">SEASON COMPLETE · S{summary.season}</p>
            <h2 id="season-recap-title">{title}</h2>
          </div>
          <button className="recap-close" onClick={close} aria-label="시즌 결산 닫기">
            ×
          </button>
        </header>

        {step === 0 && (
          <div className="recap-page recap-hero-page">
            <p>{game.name}의 한 시즌이 끝났습니다</p>
            <h3>
              <strong>{rankLabel(summary.rpAfter)}</strong>로 시즌을 마쳤어요
            </h3>
            <div className="recap-scoreboard">
              <span>
                <small>시작</small>
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
                <small>종료</small>
                <b>{rankLabel(summary.rpAfter)}</b>
              </span>
            </div>
            {view.resetApplied && (
              <p className="recap-reset">
                시즌 소프트 리셋 · {view.preResetRp.toLocaleString()} RP → {summary.rpAfter.toLocaleString()}{' '}
                RP
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="recap-page">
            <h3>{summary.matches}경기에서 남긴 평균 기록</h3>
            <div className="season-summary-grid recap-metric-list">
              <span>
                <small>평균 순위</small>
                <b>#{summary.averagePlace || '-'}</b>
              </span>
              <span>
                <small>평균 TK</small>
                <b>{summary.averageTk || '-'}</b>
              </span>
              <span>
                <small>우승</small>
                <b>
                  {summary.wins}회 · {view.winRate}%
                </b>
              </span>
              <span>
                <small>TOP 3</small>
                <b>
                  {summary.top3}회 · {view.top3Rate}%
                </b>
              </span>
              <span>
                <small>명성 획득</small>
                <b>+{summary.fameGained}</b>
              </span>
              <span>
                <small>공식 일정</small>
                <b>{summary.tournamentEvents}개</b>
              </span>
            </div>
            <div className="season-summary-note">
              <b>{summary.seasonCondition}</b>
              <span>
                {summary.conditionNote} · 자동 회복 {summary.autoRecoveryWeeks}회
              </span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="recap-page recap-next-story">
            <h3>확인할 일 {view.pendingCount}개</h3>
            <div className="recap-inbox">
              {game.turningPointAvailable && (
                <span>
                  <b>성장 전환점</b>
                  <small>다음 시즌 전에 육성 방향을 한 번 선택할 수 있어요.</small>
                </span>
              )}
              {game.scoutOffers.length > 0 && (
                <span>
                  <b>팀 제안 {game.scoutOffers.length}개</b>
                  <small>예상 역할·보상·리그를 팀 화면에서 비교하세요.</small>
                </span>
              )}
              {view.seasonEventCount > 0 && (
                <span>
                  <b>공식 대회 기록 {view.seasonEventCount}개</b>
                  <small>이번 시즌의 팀 대회 결과가 커리어 기록에 저장됐어요.</small>
                </span>
              )}
              {!game.turningPointAvailable && !game.scoutOffers.length && !view.seasonEventCount && (
                <span>
                  <b>새 시즌 준비 완료</b>
                  <small>지난 육성 계획을 유지하거나 새 계획을 고를 수 있어요.</small>
                </span>
              )}
            </div>
          </div>
        )}

        <footer className="recap-story-actions">
          {step > 0 && (
            <button className="secondary" onClick={() => setStep(step - 1)}>
              이전
            </button>
          )}
          <button onClick={() => (step < 2 ? setStep(step + 1) : close())}>
            {step < 2 ? '다음' : '다음 시즌 준비'}
          </button>
        </footer>
      </section>
    </div>
  );
}
