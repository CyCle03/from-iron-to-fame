import type { Game } from '../engine/game';
import { ContractPanel, RosterPanel } from './CareerPanels';

type TeamHubProps = { game: Game; onChange: (game: Game) => void };

export function TeamHub({ game, onChange }: TeamHubProps) {
  const starters = game.teamMembers.filter((member) => member.starter);
  const averageForm = starters.length
    ? Math.round(starters.reduce((sum, member) => sum + member.form, 0) / starters.length)
    : 0;

  return (
    <div className="team-hub">
      <section className="team-summary panel">
        <div>
          <p className="eyebrow">TEAM HUB</p>
          <h2>{game.teamName ?? '무소속 선수'}</h2>
          <p>
            {game.careerLeague} ·{' '}
            {game.contract ? `계약 ${game.contract.seasonsRemaining}시즌 남음` : '계약 없음'}
          </p>
        </div>
        <div className="team-summary-stats">
          <span>
            <small>시즌 급여</small>
            <b>{game.contract ? `${game.contract.salary} C` : '-'}</b>
          </span>
          <span>
            <small>주전 평균 폼</small>
            <b>{starters.length ? averageForm : '-'}</b>
          </span>
          <span>
            <small>팀워크</small>
            <b>{game.stats.teamwork}</b>
          </span>
          <span>
            <small>스카우트 제안</small>
            <b>{game.scoutOffers.length}개</b>
          </span>
        </div>
      </section>
      {!game.teamName && (
        <p className="team-empty panel">
          대회에서 명성을 쌓아 팀 제안을 받으세요. 계약 후 이 화면에서 로스터와 이적 제안을 함께 관리할 수
          있습니다.
        </p>
      )}
      <RosterPanel game={game} onChange={onChange} />
      <ContractPanel game={game} onChange={onChange} />
    </div>
  );
}
