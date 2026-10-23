import { seasonInfo, type Game } from '../engine/game';
type SeasonCenterProps = { game: Game };

const KEL_STAGES = ['오프닝 위크', '서킷 1', '서킷 2', '미드시즌 컵', '서킷 3', '서킷 4', '내셔널 챔피언십'];

export function SeasonCenter({ game }: SeasonCenterProps) {
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
          <p>
            데미갓 이상 팀은 시즌 진행 시 자동 참가합니다. 3개 페이즈와 LCQ·시즌 파이널 결과가 자동
            기록됩니다.
          </p>
        </article>
        <article>
          <p className="eyebrow">KEL</p>
          <h3>{KEL_STAGES[game.kelStage] ?? '시즌 일정 완료'}</h3>
          <b>{game.kelStage}/7 일정</b>
          <p>KEL 등록 선수는 시즌 진행 시 7개 일정을 자동 소화합니다. 마스터즈와 중복 출전하지 않습니다.</p>
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
