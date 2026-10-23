import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  runSeason,
  rankEntryFee,
  rankLabel,
  nextRankStep,
  type Action,
  hasExperimentTag,
  hyperCarryTankers,
  seasonInfo,
  recordMastersPhase,
  recordKelStage,
  finishMastersSeason,
  hallOfFameProgress,
  majorTitleCount,
  receiveHallHonor,
} from './engine/game';
import { simulateTournament, type TournamentKind, type TournamentResult } from './engine/tournament';
import { canEnterKelStage, canEnterMasters, nextCareerGoal } from './engine/careerRules';
import { CareerArchivePanel, ExperimentPoolPanel, RetiredCareer } from './components/CareerPanels';
import { CreateCareer } from './components/CreateCareer';
import { AppNavigation } from './components/AppNavigation';
import { EquipmentShop, GameGuide } from './components/SecondaryViews';
import { RankRecords } from './components/RankRecords';
import { RankSnapshot } from './components/RankSnapshot';
import { SeasonCenter } from './components/SeasonCenter';
import { TournamentView } from './components/TournamentView';
import { SeasonPlanner, SeasonReport } from './components/SeasonPlanner';
import { SeasonRecapSummary } from './components/SeasonRecapSummary';
import { SeasonTurningPoint } from './components/SeasonTurningPoint';
import { TeamHub } from './components/TeamHub';
import { ToastProvider, useToast } from './components/ToastProvider';
import { SEASON_ACTIONS, type NavigationTab } from './constants/ui';
import { useCareerGame } from './hooks/useCareerGame';
import './style.css';
const actions = SEASON_ACTIONS;
function App() {
  const { game, setGame, resetGame } = useCareerGame();
  const { notify } = useToast();
  const [seasonStep, setSeasonStep] = useState(0);
  const [plannedAction, setPlannedAction] = useState<Action | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [tab, setTab] = useState<NavigationTab>('대시보드');
  const [result, setResult] = useState<TournamentResult | null>(null);
  const [showSeasonRecap, setShowSeasonRecap] = useState(false);
  const applyGameChange = (next: NonNullable<typeof game>) => {
    setGame(next);
    if (next.notices[0]) notify(next.notices[0]);
  };
  if (game?.retired) return <RetiredCareer game={game} onChange={applyGameChange} />;
  if (!game) return <CreateCareer onCreate={setGame} />;
  const playWeek = (a: Action) => {
    let staged = game;
    let lastResult: TournamentResult | null = null;
    let tournamentEvents = 0;
    if (staged.careerLeague === 'KEL') {
      while ((staged.kelStage ?? 0) < 7) {
        lastResult = simulateTournament(staged, 'kel');
        staged = recordKelStage(staged, lastResult.playerPlace);
        tournamentEvents++;
      }
    } else if (staged.careerLeague !== '솔로' && staged.rp >= 2400 && (staged.fame ?? 0) >= 75) {
      while ((staged.mastersPhase ?? 0) < 3) {
        lastResult = simulateTournament(staged, 'masters');
        staged = recordMastersPhase(staged, lastResult.circuitPoints, lastResult.playerPlace);
        tournamentEvents++;
      }
      if (!staged.mastersSeason.champion) {
        staged = finishMastersSeason(staged);
        tournamentEvents += 2;
      }
    }
    const ran = runSeason(staged, a);
    if (ran.lastSeasonSummary) {
      ran.lastSeasonSummary.tournamentEvents = tournamentEvents;
      ran.lastSeasonSummary.fameGained = ran.fame - game.fame;
    }
    setResult(lastResult);
    setReport(
      tournamentEvents ? '시즌 완료 · 공식 대회 ' + tournamentEvents + '개 일정 자동 진행' : ran.history[0],
    );
    notify(tournamentEvents ? `시즌 완료 · 공식 대회 ${tournamentEvents}개 일정 자동 진행` : ran.history[0]);
    setGame(ran);
    setShowSeasonRecap(true);
    setSeasonStep(0);
    setPlannedAction(ran.lastSeasonPlan);
    setTab('대시보드');
  };
  const stat = (label: string, value: number) => (
    <div className="stat">
      <span>{label}</span>
      <b>{value}</b>
      <i>
        <i style={{ width: `${value}%` }} />
      </i>
    </div>
  );
  const hof = hallOfFameProgress(game);
  const majorTitles = majorTitleCount(game);
  const rankStep = nextRankStep(game.rp);
  const nextGoal = nextCareerGoal(game);
  const mastersEligible = canEnterMasters(game);
  const kelEligible = canEnterKelStage(game);
  const tournament = (kind: TournamentKind) => {
    if (kind === 'masters' && !mastersEligible) {
      applyGameChange(recordMastersPhase(game, 0));
      return;
    }
    if (kind === 'kel' && !kelEligible) {
      applyGameChange(recordKelStage(game, 8));
      return;
    }
    const r = simulateTournament(game, kind);
    setResult(r);
    applyGameChange(
      kind === 'masters'
        ? recordMastersPhase(game, r.circuitPoints, r.playerPlace)
        : recordKelStage(game, r.playerPlace),
    );
  };
  return (
    <main className="app">
      <header>
        <div>
          <p className="eyebrow">
            {seasonInfo(game.season).year} · 시즌 {seasonInfo(game.season).number} · S{game.season}
          </p>
          <h1>
            {game.name} <em>{rankLabel(game.rp)}</em>
          </h1>
        </div>
        <div className="rp">
          <b>{game.rp}</b> RP
          <br />
          <small>행동력 {game.actionPoints}/3</small>
        </div>
        <small className="save-indicator">✓ 이 브라우저에 자동 저장됨</small>
        <div className="credits">C {game.credits.toLocaleString()}</div>
        <div className="fame-hud">
          <small>명성</small>
          <b>{game.fame ?? 0}</b>
          <small>{game.teamName ?? '무소속'}</small>
        </div>
        <div className="rank-hud">
          <div>
            <small>현재 티어</small>
            <b>{rankLabel(game.rp)}</b>
          </div>
          <div>
            <small>랭크 포인트</small>
            <b>{game.rp.toLocaleString()} RP</b>
          </div>
          <div>
            <small>다음 승급</small>
            <b>{rankStep ? rankStep.label + '까지 ' + (rankStep.min - game.rp) + ' RP' : '서버 순위'}</b>
          </div>
          <div>
            <small>입장료</small>
            <b>{rankEntryFee(game.rp)} RP</b>
          </div>
        </div>
      </header>
      <AppNavigation game={game} activeTab={tab} onNavigate={setTab} onImport={setGame} onReset={resetGame} />
      <div className="notice">✦ {report ?? game.notices[0]}</div>
      {tab === '대시보드' && (
        <>
          {' '}
          <section className="career-track">
            <div>
              <p className="eyebrow">CAREER PATH</p>
              <h2>광물에서 명전까지</h2>
            </div>
            <div className="milestones">
              <span className="done">랭크 입문</span>
              <span className={game.rp >= 1000 ? 'done' : ''}>최상위 랭커</span>
              <span className={game.careerLeague === '마스터즈' || game.careerLeague === 'KEL' ? 'done' : ''}>
                마스터즈
              </span>
              <span className={game.careerLeague === 'KEL' ? 'done' : ''}>KEL</span>
              <span className={game.hallOfFame ? 'done' : ''}>명예의 전당</span>
            </div>
          </section>
          <section className="next-goal-hero">
            <div>
              <p className="eyebrow">NEXT CAREER MOMENT</p>
              <h2>{nextGoal.title}</h2>
              <p>{nextGoal.detail}</p>
            </div>
            <button onClick={() => setSeasonStep(0)}>이번 시즌으로 도전하기</button>
          </section>
          <SeasonPlanner
            game={game}
            step={seasonStep}
            selected={plannedAction ?? game.lastSeasonPlan}
            onStepChange={(nextStep) => {
              if (nextStep === 0) setPlannedAction(null);
              setSeasonStep(nextStep);
            }}
            onSelect={setPlannedAction}
            onRun={playWeek}
          />
          <section className="season-unit">
            <span>
              성장 중점 ·{' '}
              {(game.trainingFocus ?? [])
                .map(
                  (x) =>
                    (
                      ({
                        physical: '피지컬',
                        combat: '교전',
                        macro: '운영',
                        judgement: '판단',
                        teamwork: '팀워크',
                        mental: '멘탈',
                        focus: '집중력',
                        adaptability: '적응력',
                      }) as Record<string, string>
                    )[x],
                )
                .join(' · ')}
            </span>
            <b>{game.seasonEvent}</b>
            <span>이번 진행 단위</span>
            <b>
              {seasonInfo(game.season).year}년 시즌 {seasonInfo(game.season).number}
            </b>
            <small>한 번의 선택으로 12주(1시즌)가 진행되며, 1년은 약 3개 시즌입니다.</small>
          </section>
          <SeasonReport game={game} />
          <RankSnapshot matches={game.matches} title="최근 20경기" compact />
          <SeasonTurningPoint game={game} onChange={applyGameChange} />
          <section className="hall-panel panel hall-categories">
            <div className="hall-heading">
              <p className="eyebrow">ESPORTS HALL OF FAME</p>
              <h2>세 가지 선정 기록</h2>
              <small>스타즈·히어로즈·아너스는 순차 승급이 아닌 서로 다른 선정 부문입니다.</small>
            </div>
            <div className="hall-category-grid">
              <article>
                <strong>스타즈</strong>
                <em>올해의 팬 선택</em>
                <div className="hof-reqs">
                  <span className={hof.stars.fame ? 'done' : ''}>명성 750</span>
                  <span className={hof.stars.seasonPerformance ? 'done' : ''}>시즌 3승 또는 TOP3 12회</span>
                </div>
                <button
                  disabled={!Object.values(hof.stars).every(Boolean)}
                  onClick={() => applyGameChange(receiveHallHonor(game, '스타즈'))}
                >
                  {game.lastStarsSeason === game.season
                    ? 'S' + game.season + ' 선정 완료'
                    : '스타즈 심사 · 통산 ' + game.starsSelections + '회'}
                </button>
              </article>
              <article>
                <strong>히어로즈</strong>
                <em>현역 메이저 업적</em>
                <div className="hof-reqs">
                  <span className={hof.heroes.majorTitles ? 'done' : ''}>메이저 우승 {majorTitles}/3</span>
                </div>
                <button
                  disabled={
                    game.hallOfFameHonors.includes('히어로즈') || !Object.values(hof.heroes).every(Boolean)
                  }
                  onClick={() => applyGameChange(receiveHallHonor(game, '히어로즈'))}
                >
                  {game.hallOfFameHonors.includes('히어로즈') ? '히어로즈 선정 완료' : '히어로즈 심사'}
                </button>
              </article>
              <article>
                <strong>아너스</strong>
                <em>은퇴 선수 영구 헌액</em>
                <div className="hof-reqs">
                  <span>은퇴 후 기록 보관소에서 심사</span>
                </div>
                <button disabled>아너스는 은퇴 후</button>
              </article>
            </div>
          </section>
          <section className="er-hud">
            <div className="portrait">{game.main.slice(0, 1)}</div>
            <div className="hud-bars">
              <div>
                <span>시즌 운영</span>
                <i className="mental">
                  <i style={{ width: '100%' }} />
                </i>
                <b>{game.lastSeasonSummary?.seasonCondition ?? '준비'}</b>
              </div>
              <div>
                <span>멘탈</span>
                <i className="mental">
                  <i style={{ width: game.morale + '%' }} />
                </i>
                <b>{game.morale}</b>
              </div>
            </div>
            <div className="hud-meta">
              <small>실험체</small>
              <b>{game.main}</b>
              <small>
                역할 · {game.role ?? '기존 커리어'}
                {hasExperimentTag(game.main, '하이퍼캐리') && (game.teammateRoles ?? []).includes('서포터')
                  ? ' · 서포터 동행 보너스'
                  : ''}
              </small>
            </div>
            <div className="match-feed">
              <small>대회 준비</small>
              <b>마스터즈 D-28</b>
              <span>랭크와 훈련으로 전력을 올리세요.</span>
            </div>
          </section>
          <section className="grid">
            <article>
              <h2>선수 상태</h2>
              <div className="status">
                <span>
                  멘탈 <b>{game.morale}</b>
                </span>
                <span>
                  역할 <b>{game.role ?? '기존 커리어'}</b>
                </span>
                <span>
                  팀원 역할 <b>{(game.teammateRoles ?? []).join(' · ')}</b>
                </span>
                <span>
                  팀원 실험체 <b>{(game.teammateExperiments ?? []).join(' · ') || '로스터 확정 대기'}</b>
                </span>
                <span>
                  대회 시그니처 <b>{game.signatureComp ?? '일반 조합'}</b>
                </span>
                <span>
                  검증 2인 시너지 <b>{game.duoSynergy ?? '없음'}</b>
                </span>
                <span>
                  시너지{' '}
                  <b>
                    {game.main === '아르다' &&
                    (game.teammateRoles ?? []).includes('탱커') &&
                    (game.teammateRoles ?? []).includes('근거리 딜러')
                      ? '탱커 + 근접 딜러 · 아르다 시너지'
                      : hasExperimentTag(game.main, '하이퍼캐리') &&
                          (game.teammateRoles ?? []).includes('서포터') &&
                          !(game.teammateExperiments ?? []).includes('아르다')
                        ? (game.teammateExperiments ?? []).some((x) => hyperCarryTankers.includes(x))
                          ? '서포터 + 보호 탱커 · 강화 캐리 보너스'
                          : '서포터 동행 · 캐리 보너스'
                        : '표준 조합'}
                  </b>
                </span>
                <span>
                  주력 <b>{game.main}</b>
                </span>
                {hasExperimentTag(game.main, '하이퍼캐리') && (
                  <span>
                    플레이 태그 <b className="tag-hypercarry">하이퍼캐리</b>
                  </span>
                )}
                <span>
                  숙련도 <b>{game.mastery[game.main]}</b>
                </span>
              </div>
            </article>
            <article>
              <h2>다음 목표</h2>
              <p>{nextGoal.title}</p>
              <small>{nextGoal.detail}</small>
              <button className="goal-cta" onClick={() => setTab('시즌 플랜')}>
                시즌 계획 세우기 →
              </button>
            </article>
          </section>
          <section className="panel core-stats">
            <h2>핵심 능력치</h2>
            <div className="stats">
              {stat('피지컬', game.stats.physical)}
              {stat('교전', game.stats.combat)}
              {stat('운영', game.stats.macro)}
              {stat('판단', game.stats.judgement)}
              {stat('팀워크', game.stats.teamwork)}
              {stat('멘탈', game.stats.mental)}
              {stat('집중력', game.stats.focus)}
              {stat('적응력', game.stats.adaptability)}
            </div>
          </section>
        </>
      )}
      {tab === '시즌 센터' && (
        <SeasonCenter
          game={game}
          mastersEligible={mastersEligible}
          kelEligible={kelEligible}
          onChange={applyGameChange}
          onTournament={tournament}
        />
      )}
      {tab === '시즌 플랜' && (
        <>
          <section className="actions">
            <div className="season-action-intro">
              <p className="eyebrow">SEASON PLAN</p>
              <h2>한 가지 방향으로 시즌 전체를 운영합니다</h2>
              <p>
                선택한 성장 방향을 기준으로 12주 일정·회복일·경기 부담을 자동 조절합니다. 주마다 컨디션을
                관리할 필요가 없습니다.
              </p>
            </div>
            {actions.map((a) => (
              <button key={a.id} onClick={() => playWeek(a.id)}>
                <b>{a.title}</b>
                <small>{a.desc}</small>
              </button>
            ))}
          </section>
          <ExperimentPoolPanel game={game} onChange={applyGameChange} />
          <CareerArchivePanel game={game} onChange={applyGameChange} />
        </>
      )}
      {tab === '팀' && <TeamHub game={game} onChange={applyGameChange} />}
      {tab === '장비 상점' && <EquipmentShop game={game} onChange={applyGameChange} />}
      {tab === '대회' && (
        <TournamentView
          game={game}
          result={result}
          mastersEligible={mastersEligible}
          kelEligible={kelEligible}
          onChange={applyGameChange}
          onTournament={tournament}
        />
      )}
      {tab === '선수 기록' && <RankRecords game={game} />}
      {tab === '게임 안내' && <GameGuide />}
      <SeasonRecapSummary game={game} open={showSeasonRecap} onClose={() => setShowSeasonRecap(false)} />
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <App />
  </ToastProvider>,
);
