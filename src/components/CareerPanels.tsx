import {
  acceptScoutOffer,
  careerTotals,
  changeStarter,
  characters,
  hallOfFameProgress,
  majorTitleCount,
  mvpCount,
  receiveHallHonor,
  renewContract,
  replacePoolExperiment,
  retireCareer,
  roleForExperiment,
  trainExperiment,
  type Game,
} from '../engine/game';
import { saveCareerCard } from '../utils/careerCard';
import { starterSwapImpact } from '../engine/careerRules';

type GamePanelProps = {
  game: Game;
  onChange: (game: Game) => void;
};

export function ExperimentPoolPanel({ game, onChange }: GamePanelProps) {
  return (
    <section className="panel pool-panel">
      <div className="meta-banner">
        <p className="eyebrow">CURRENT PATCH META</p>
        <h2>{game.seasonMeta.name}</h2>
        <p>{game.seasonMeta.description}</p>
      </div>
      <h2>대회 실험체 풀</h2>
      <p>
        숙련도가 높은 실험체부터 선택합니다. KEL에서 각 실험체를 두 번 사용하면 다음 보조 픽으로 넘어갑니다.
      </p>
      <div className="pool-grid">
        {game.experimentPool.map((name, index) => {
          const role = roleForExperiment(name);
          const receivesMetaBonus = role && game.seasonMeta.strongRoles.includes(role);
          return (
            <article key={name}>
              <small>{index === 0 ? '주력' : `보조 ${index}`}</small>
              <b>{name}</b>
              <span>
                {role} · 숙련도 {game.mastery[name] ?? 0}
              </span>
              <em>{receivesMetaBonus ? '메타 적합 +5' : '메타 보정 없음'}</em>
              <button disabled={game.actionPoints < 1} onClick={() => onChange(trainExperiment(game, name))}>
                집중 훈련
              </button>
              {index > 0 && (
                <select
                  aria-label={`보조 실험체 ${index} 변경`}
                  value={name}
                  onChange={(event) => onChange(replacePoolExperiment(game, index, event.target.value))}
                >
                  {characters
                    .filter((character) => !game.experimentPool.includes(character) || character === name)
                    .map((character) => (
                      <option key={character}>{character}</option>
                    ))}
                </select>
              )}
            </article>
          );
        })}
      </div>
      <small>보조 실험체 변경 비용 250 C · 새 실험체 시작 숙련도 8</small>
    </section>
  );
}

export function ContractPanel({ game, onChange }: GamePanelProps) {
  return (
    <section className="panel contract-panel">
      <p className="eyebrow">TEAM & CONTRACT</p>
      <h2>계약·이적 시장</h2>
      {game.contract ? (
        <div className="current-contract">
          <b>{game.contract.team}</b>
          <span>
            {game.contract.league} · 잔여 {game.contract.seasonsRemaining}시즌 · 시즌 급여{' '}
            {game.contract.salary} C
          </span>
          <button disabled={game.contract.seasonsRemaining > 1} onClick={() => onChange(renewContract(game))}>
            2시즌 재계약
          </button>
        </div>
      ) : (
        <p>현재 무소속입니다. 지역 컵에서 명성을 쌓거나 스카우트 제안을 선택하세요.</p>
      )}
      <div className="offer-grid">
        {game.scoutOffers.map((offer, index) => {
          const salaryChange = offer.salary - (game.contract?.salary ?? 0);
          return (
            <article key={offer.team}>
              <b>{offer.team}</b>
              <span>
                {offer.league} · {offer.seasonsRemaining}시즌
              </span>
              <small>
                급여 {offer.salary} C · 계약금 {offer.signingBonus} C
              </small>
              <div className="contract-comparison">
                <span className={salaryChange >= 0 ? 'up' : 'down'}>
                  현재 대비 급여 {salaryChange >= 0 ? '+' : ''}
                  {salaryChange} C
                </span>
                <span>
                  {game.contract ? `${game.contract.league} → ${offer.league}` : `${offer.league} 첫 계약`}
                </span>
              </div>
              <button onClick={() => onChange(acceptScoutOffer(game, index))}>이적 제안 수락</button>
            </article>
          );
        })}
      </div>
      {!game.scoutOffers.length && <small>새 스카우트 제안은 시즌 결산 후 도착합니다.</small>}
    </section>
  );
}

export function RosterPanel({ game, onChange }: GamePanelProps) {
  if (!game.teamName) return null;
  return (
    <section className="panel roster-management">
      <p className="eyebrow">ACTIVE ROSTER</p>
      <h2>주전·후보 관리</h2>
      <p>
        플레이어와 주전 팀원 2명이 실제 대회 전력을 구성합니다. 교체 직후 팀워크가 3 감소하며 합동 훈련으로
        폼을 회복할 수 있습니다.
      </p>
      <div className="roster-grid">
        {game.teamMembers.map((member, index) => {
          const impact = starterSwapImpact(game, index);
          return (
            <article
              className={member.starter ? 'starter' : ''}
              key={`${member.nickname}-${member.experiment}`}
            >
              <small>{member.starter ? '주전' : '후보'}</small>
              <b>{member.nickname}</b>
              <span>
                {member.experiment} · {member.role}
              </span>
              <span>
                실력 {member.skill} · 폼 {member.form} · 피로 {member.fatigue}
              </span>
              {impact && (
                <small className="swap-preview">
                  교체 예상 · {impact.benchedNickname} 대신 투입 · 단순 전력{' '}
                  {impact.powerChange >= 0 ? '+' : ''}
                  {impact.powerChange} · 팀워크 {impact.teamworkChange}
                </small>
              )}
              <button disabled={member.starter} onClick={() => onChange(changeStarter(game, index))}>
                {member.starter ? '주전 등록됨' : '주전으로 교체'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CareerArchivePanel({ game, onChange }: GamePanelProps) {
  const totals = careerTotals(game);
  return (
    <section className="panel archive-panel">
      <p className="eyebrow">CAREER ARCHIVE</p>
      <h2>통산 기록·수상</h2>
      <div className="archive-stats">
        <span>
          대회 <b>{totals.events}</b>
        </span>
        <span>
          우승 <b>{totals.wins}</b>
        </span>
        <span>
          포디움 <b>{totals.podiums}</b>
        </span>
        <span>
          대표 실험체 <b>{totals.representative}</b>
        </span>
      </div>
      <p>팀 이력 · {game.teamHistory.join(' → ') || '무소속'}</p>
      <p>수상 · {game.awards.join(' · ') || '아직 수상 기록 없음'}</p>
      <button onClick={() => onChange(retireCareer(game))}>현역 은퇴 및 기록 보존</button>
    </section>
  );
}

export function RetiredCareer({ game, onChange }: GamePanelProps) {
  const totals = careerTotals(game);
  const progress = hallOfFameProgress(game);
  const majorTitles = majorTitleCount(game);
  const mvps = mvpCount(game);
  const requirementLabels: Record<string, string> = {
    retired: '은퇴',
    heroes: '히어로즈 선정',
    majorTitles: '메이저 우승 5회',
    mvps: 'MVP 2회',
    fame: '명성 2,500',
  };
  const missing = Object.entries(progress.honors)
    .filter(([, done]) => !done)
    .map(([key]) => requirementLabels[key]);
  return (
    <main className="app retired-career">
      <p className="eyebrow">RETIRED CAREER · S{game.retirementSeason}</p>
      <h1>
        {game.name} <em>{game.hallOfFame ? '명예의 전당' : '은퇴 선수'}</em>
      </h1>
      <section className="panel">
        <h2>커리어 기록 보관소</h2>
        <div className="archive-stats">
          <span>
            대회 <b>{totals.events}</b>
          </span>
          <span>
            우승 <b>{totals.wins}</b>
          </span>
          <span>
            포디움 <b>{totals.podiums}</b>
          </span>
          <span>
            대표 실험체 <b>{totals.representative}</b>
          </span>
          <span>
            최종 랭크 <b>{game.rank}</b>
          </span>
          <span>
            트로피 <b>{game.trophies}</b>
          </span>
        </div>
        <p>팀 이력 · {game.teamHistory.join(' → ') || '무소속'}</p>
        <p>수상 · {game.awards.join(' · ') || '수상 없음'}</p>
        <button onClick={() => saveCareerCard(game)}>커리어 카드 저장</button>
        <div className="archive-stats">
          <span>
            메이저 우승 <b>{majorTitles}</b>
          </span>
          <span>
            MVP <b>{mvps}</b>
          </span>
          <span>
            스타즈 <b>{game.starsSelections}회</b>
          </span>
          <span>
            히어로즈 <b>{game.hallOfFameHonors.includes('히어로즈') ? '선정' : '미선정'}</b>
          </span>
        </div>
        <button
          disabled={game.hallOfFame || missing.length > 0}
          onClick={() => onChange(receiveHallHonor(game, '아너스'))}
        >
          {game.hallOfFame ? '아너스 영구 헌액 완료' : '아너스 영구 헌액 심사'}
        </button>
        {missing.length > 0 && <p className="official-note">미충족 조건: {missing.join(' · ')}</p>}
      </section>
    </main>
  );
}
