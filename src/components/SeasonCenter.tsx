import { finishMastersSeason, seasonInfo, type Game } from '../engine/game';
import type { TournamentKind } from '../engine/tournament';

type SeasonCenterProps = {
  game: Game;
  mastersEligible: boolean;
  kelEligible: boolean;
  onChange: (game: Game) => void;
  onTournament: (kind: TournamentKind) => void;
};

const KEL_STAGES = ['오프닝 위크', '서킷 1', '서킷 2', '미드시즌 컵', '서킷 3', '서킷 4', '내셔널 챔피언십'];

export function SeasonCenter({
  game,
  mastersEligible,
  kelEligible,
  onChange,
  onTournament,
}: SeasonCenterProps) {
  return (
    <section className="season-center panel">
      <h2>
        {seasonInfo(game.season).year} 시즌 {seasonInfo(game.season).number} 센터
      </h2>
      <div className="season-columns">
        <article>
          <p className="eyebrow">MASTERS · 48 TEAMS</p>
          <h3>마스터즈 페이즈 {game.mastersPhase}/3</h3>
          <b>{game.mastersPoints} CP</b>
          <p>3개 페이즈 누적 상위 7팀은 시즌 파이널 직행, 마지막 1팀은 LCQ에서 선발됩니다.</p>
          <button disabled={!mastersEligible} onClick={() => onTournament('masters')}>
            {game.mastersPhase >= 3 ? '페이즈 완료' : '마스터즈 다음 페이즈 진행'}
          </button>
          {game.mastersPhase >= 3 && (
            <button
              disabled={!!game.mastersSeason.champion}
              onClick={() => onChange(finishMastersSeason(game))}
            >
              {game.mastersSeason.champion ? '시즌 파이널 종료' : 'LCQ · 시즌 파이널 진행'}
            </button>
          )}
        </article>
        <article>
          <p className="eyebrow">KEL</p>
          <h3>{KEL_STAGES[game.kelStage] ?? '시즌 일정 완료'}</h3>
          <b>{game.kelStage}/7 일정</b>
          <p>
            16개 지역 대표팀 일정입니다. 마스터즈는 3픽밴, KEL 결승은 2-PICK-CAP·순차 체크포인트로 각기
            시뮬레이션합니다.
          </p>
          <button disabled={!kelEligible} onClick={() => onTournament('kel')}>
            {game.kelStage >= 7 ? 'KEL 시즌 완료' : '현재 KEL 일정 진행'}
          </button>
        </article>
      </div>
      <div className="season-flow">
        {['P1', 'P2', 'P3'].map((label, index) => (
          <span key={label} className={game.mastersPhase >= index + 1 ? 'done' : ''}>
            {label}
          </span>
        ))}
        <span className={game.mastersSeason.lcqWinner ? 'done' : ''}>LCQ</span>
        <span className={game.mastersSeason.champion ? 'done' : ''}>시즌 파이널</span>
      </div>
      {game.mastersPhase > 0 && (
        <div className="standings">
          <h3>마스터즈 누적 순위</h3>
          {[...game.mastersSeason.standings]
            .sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name, 'ko'))
            .slice(0, 10)
            .map((team, index) => (
              <div key={team.id}>
                <b>{index + 1}</b>
                <span>
                  {team.name}
                  {team.id === 'player' ? ' · 내 팀' : ''}
                </span>
                <strong>{team.points} CP</strong>
                <small>{team.qualification ?? ''}</small>
              </div>
            ))}
          {game.mastersSeason.champion && (
            <p>
              LCQ 우승 {game.mastersSeason.lcqWinner} · 시즌 우승 {game.mastersSeason.champion}
              {game.mastersSeason.playerFinalPlace ? ` · 최종 ${game.mastersSeason.playerFinalPlace}위` : ''}
            </p>
          )}
        </div>
      )}
      <p className="official-note">
        대회 실제 운영 구조를 바탕으로 한 게임용 일정입니다. KEL 로스터 자격과 실제 경기 결과는 별도로
        검증되는 확장 데이터입니다.
      </p>
    </section>
  );
}
