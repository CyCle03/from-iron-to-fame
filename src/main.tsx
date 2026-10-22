import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  runSeason,
  rankEntryFee,
  type Action,
  hasExperimentTag,
  hyperCarryTankers,
  seasonInfo,
  recordMastersPhase,
  recordKelStage,
  finishMastersSeason,
  hallOfFameProgress,
  inductHallOfFame,
} from './engine/game';
import { simulateTournament, type TournamentKind, type TournamentResult } from './engine/tournament';
import { canEnterKelStage, canEnterMasters, nextCareerGoal } from './engine/careerRules';
import {
  CareerArchivePanel,
  ContractPanel,
  ExperimentPoolPanel,
  RetiredCareer,
  RosterPanel,
} from './components/CareerPanels';
import { CreateCareer } from './components/CreateCareer';
import { AppNavigation } from './components/AppNavigation';
import { EquipmentShop, GameGuide, PlayerRecords } from './components/SecondaryViews';
import { SeasonCenter } from './components/SeasonCenter';
import { TournamentView } from './components/TournamentView';
import { SEASON_ACTIONS, type NavigationTab } from './constants/ui';
import { useCareerGame } from './hooks/useCareerGame';
import './style.css';
const actions = SEASON_ACTIONS;
function App() {
  const { game, setGame, resetGame } = useCareerGame();
  const [seasonStep, setSeasonStep] = useState(0);
  const [plannedAction, setPlannedAction] = useState<Action | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [tab, setTab] = useState<NavigationTab>('대시보드');
  const [result, setResult] = useState<TournamentResult | null>(null);
  if (game?.retired) return <RetiredCareer game={game} onChange={setGame} />;
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
    setGame(ran);
    setSeasonStep(0);
    setPlannedAction(null);
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
  const nextGoal = nextCareerGoal(game);
  const mastersEligible = canEnterMasters(game);
  const kelEligible = canEnterKelStage(game);
  const tournament = (kind: TournamentKind) => {
    if (kind === 'masters' && !mastersEligible) {
      setGame(recordMastersPhase(game, 0));
      return;
    }
    if (kind === 'kel' && !kelEligible) {
      setGame(recordKelStage(game, 24));
      return;
    }
    const r = simulateTournament(game, kind);
    setResult(r);
    setGame(
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
            {game.name} <em>{game.rank}</em>
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
            <b>{game.rank}</b>
          </div>
          <div>
            <small>랭크 포인트</small>
            <b>{game.rp.toLocaleString()} RP</b>
          </div>
          <div>
            <small>컨디션</small>
            <b>{100 - game.fatigue}/100</b>
          </div>
          <div>
            <small>다음 입장료</small>
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
          <section className="weekly-plan season-wizard">
            <p className="eyebrow">
              SEASON {seasonInfo(game.season).number} · {seasonStep + 1}/3
            </p>
            {seasonStep === 0 && (
              <>
                <h2>이번 시즌의 목표를 정하세요</h2>
                <p>한 가지 방향을 고르면, 훈련·랭크·회복이 자동으로 배분됩니다.</p>
                <button className="primary" onClick={() => setSeasonStep(1)}>
                  시즌 계획 세우기
                </button>
              </>
            )}
            {seasonStep === 1 && (
              <>
                <h2>주력 운영 방향</h2>
                <div className="plan-actions">
                  {actions.map((a) => (
                    <button
                      key={a.id}
                      className={plannedAction === a.id ? 'selected' : ''}
                      onClick={() => setPlannedAction(a.id)}
                    >
                      <b>{a.title}</b>
                      <small>{a.desc}</small>
                    </button>
                  ))}
                </div>
                <div className="wizard-actions">
                  <button onClick={() => setSeasonStep(0)}>이전</button>
                  <button className="primary" disabled={!plannedAction} onClick={() => setSeasonStep(2)}>
                    계획 확인
                  </button>
                </div>
              </>
            )}
            {seasonStep === 2 && plannedAction && (
              <>
                <h2>{actions.find((x) => x.id === plannedAction)?.title} 시즌</h2>
                <div className="wizard-summary">
                  <b>12주 자동 운영</b>
                  <span>{actions.find((x) => x.id === plannedAction)?.desc}</span>
                  <small>피로가 과도하게 누적되지 않도록 회복·리뷰 주간을 포함합니다.</small>
                </div>
                <div className="wizard-actions">
                  <button onClick={() => setSeasonStep(1)}>이전</button>
                  <button className="primary" onClick={() => playWeek(plannedAction)}>
                    시즌 진행
                  </button>
                </div>
              </>
            )}
          </section>
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
          {game.lastSeasonSummary && (
            <section className="season-report panel">
              <div>
                <p className="eyebrow">SEASON REPORT</p>
                <h2>S{game.lastSeasonSummary.season} 시즌 결산</h2>
              </div>
              <div className="report-stats">
                <span>
                  랭크{' '}
                  <b>
                    {game.lastSeasonSummary.rankBefore} → {game.lastSeasonSummary.rankAfter}
                  </b>
                </span>
                <span>
                  RP{' '}
                  <b>
                    {game.lastSeasonSummary.rpAfter - game.lastSeasonSummary.rpBefore >= 0 ? '+' : ''}
                    {game.lastSeasonSummary.rpAfter - game.lastSeasonSummary.rpBefore}
                  </b>
                </span>
                <span>
                  명성 <b>+{game.lastSeasonSummary.fameGained}</b>
                </span>
                <span>
                  랭크 경기 <b>{game.lastSeasonSummary.matches}판</b>
                </span>
                <span>
                  최고 순위{' '}
                  <b>{game.lastSeasonSummary.bestPlace ? game.lastSeasonSummary.bestPlace + '위' : '-'}</b>
                </span>
                <span>
                  공식 일정 <b>{game.lastSeasonSummary.tournamentEvents}개</b>
                </span>
              </div>
            </section>
          )}
          <section className="hall-panel panel">
            <div>
              <p className="eyebrow">HALL OF FAME</p>
              <h2>{game.hallOfFame ? '명예의 전당 헌액 완료' : '명예의 전당 도전'}</h2>
            </div>
            <div className="hof-reqs">
              <span className={hof.fame ? 'done' : ''}>명성 500</span>
              <span className={hof.trophies ? 'done' : ''}>우승 3회</span>
              <span className={hof.kel ? 'done' : ''}>KEL 선수</span>
              <span className={hof.rank ? 'done' : ''}>메테오라이트+</span>
            </div>
            <button
              disabled={game.hallOfFame || !Object.values(hof).every(Boolean)}
              onClick={() => setGame(inductHallOfFame(game))}
            >
              {game.hallOfFame ? '루미아의 전설' : '명예의 전당 헌액'}
            </button>
          </section>
          <section className="er-hud">
            <div className="portrait">{game.main.slice(0, 1)}</div>
            <div className="hud-bars">
              <div>
                <span>컨디션</span>
                <i>
                  <i style={{ width: 100 - game.fatigue + '%' }} />
                </i>
                <b>{100 - game.fatigue}</b>
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
                  피로도 <b>{game.fatigue}</b>
                </span>
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
              <button className="goal-cta" onClick={() => setTab('주간 행동')}>
                이번 주 계획 세우기 →
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
          onChange={setGame}
          onTournament={tournament}
        />
      )}
      {tab === '주간 행동' && (
        <>
          <section className="actions">
            {actions.map((a) => (
              <button key={a.id} onClick={() => playWeek(a.id)}>
                <b>{a.title}</b>
                <small>{a.desc}</small>
              </button>
            ))}
          </section>
          <ExperimentPoolPanel game={game} onChange={setGame} />
          <RosterPanel game={game} onChange={setGame} />
          <ContractPanel game={game} onChange={setGame} />
          <CareerArchivePanel game={game} onChange={setGame} />
        </>
      )}
      {tab === '장비 상점' && <EquipmentShop game={game} onChange={setGame} />}
      {tab === '대회' && (
        <TournamentView
          game={game}
          result={result}
          mastersEligible={mastersEligible}
          kelEligible={kelEligible}
          onChange={setGame}
          onTournament={tournament}
        />
      )}
      {tab === '선수 기록' && <PlayerRecords game={game} />}
      {tab === '게임 안내' && <GameGuide />}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
