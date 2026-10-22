import { seasonInfo, type Action, type Game } from '../engine/game';
import { SEASON_ACTIONS } from '../constants/ui';

type SeasonPlannerProps = {
  game: Game;
  step: number;
  selected: Action | null;
  onStepChange: (step: number) => void;
  onSelect: (action: Action) => void;
  onRun: (action: Action) => void;
};

export function SeasonPlanner({ game, step, selected, onStepChange, onSelect, onRun }: SeasonPlannerProps) {
  const plan = SEASON_ACTIONS.find((option) => option.id === selected);
  const officialSchedule =
    game.careerLeague === 'KEL'
      ? 'KEL 7개 일정 자동 진행'
      : game.careerLeague === '솔로'
        ? '공식 팀 대회 없음'
        : '마스터즈 최대 5개 일정 자동 진행';
  return (
    <section className="weekly-plan season-wizard" aria-labelledby="season-plan-title">
      <p className="eyebrow">
        SEASON {seasonInfo(game.season).number} · {step + 1}/3
      </p>
      {step === 0 && (
        <>
          <h2 id="season-plan-title">이번 시즌의 목표를 정하세요</h2>
          <p>예상 성장과 경기 부담을 비교한 뒤 12주 운영 방향을 선택할 수 있습니다.</p>
          <button className="primary" onClick={() => onStepChange(1)}>
            시즌 계획 세우기
          </button>
        </>
      )}
      {step === 1 && (
        <>
          <h2 id="season-plan-title">주력 운영 방향</h2>
          <div className="plan-actions">
            {SEASON_ACTIONS.map((option) => (
              <button
                key={option.id}
                aria-pressed={selected === option.id}
                className={selected === option.id ? 'selected' : ''}
                onClick={() => onSelect(option.id)}
              >
                <b>{option.title}</b>
                <small>{option.desc}</small>
                <span>{option.focus}</span>
                <em>
                  {option.load} · 랭크 약 {option.rankedMatches}판
                </em>
              </button>
            ))}
          </div>
          <div className="wizard-actions">
            <button onClick={() => onStepChange(0)}>이전</button>
            <button className="primary" disabled={!selected} onClick={() => onStepChange(2)}>
              계획 확인
            </button>
          </div>
        </>
      )}
      {step === 2 && plan && (
        <>
          <h2 id="season-plan-title">{plan.title} 시즌</h2>
          <div className="season-preview">
            <span>
              <small>주요 성장</small>
              <b>{plan.focus}</b>
            </span>
            <span>
              <small>예상 부담</small>
              <b>{plan.load}</b>
            </span>
            <span>
              <small>랭크 경기</small>
              <b>약 {plan.rankedMatches}판</b>
            </span>
            <span>
              <small>공식 일정</small>
              <b>{officialSchedule}</b>
            </span>
          </div>
          <p className="preview-note">실제 결과는 선수 능력치, 메타, 피로와 경기 결과에 따라 달라집니다.</p>
          <div className="wizard-actions">
            <button onClick={() => onStepChange(1)}>이전</button>
            <button className="primary" onClick={() => onRun(plan.id)}>
              12주 시즌 진행
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function SeasonReport({ game }: { game: Game }) {
  const summary = game.lastSeasonSummary;
  if (!summary) return null;
  const rpChange = summary.rpAfter - summary.rpBefore;
  return (
    <section className="season-report panel">
      <div>
        <p className="eyebrow">SEASON REPORT</p>
        <h2>S{summary.season} 시즌 변화</h2>
        <p>{SEASON_ACTIONS.find((option) => option.id === summary.plan)?.title} 운영 결과</p>
      </div>
      <div className="report-stats">
        <span>
          랭크{' '}
          <b>
            {summary.rankBefore} → {summary.rankAfter}
          </b>
        </span>
        <span>
          RP{' '}
          <b className={rpChange >= 0 ? 'up' : 'down'}>
            {rpChange >= 0 ? '+' : ''}
            {rpChange}
          </b>
        </span>
        <span>
          명성 <b>+{summary.fameGained}</b>
        </span>
        <span>
          랭크 경기 <b>{summary.matches}판</b>
        </span>
        <span>
          최고 순위 <b>{summary.bestPlace ? `${summary.bestPlace}위` : '-'}</b>
        </span>
        <span>
          공식 일정 <b>{summary.tournamentEvents}개</b>
        </span>
      </div>
    </section>
  );
}
