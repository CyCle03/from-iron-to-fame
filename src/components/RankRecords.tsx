import type { Game } from '../engine/game';
import { saveCareerCard } from '../utils/careerCard';
import { RankSnapshot } from './RankSnapshot';

export function RankRecords({ game }: { game: Game }) {
  return (
    <section className="panel records-page">
      <RankSnapshot matches={game.matches} title="최근 20경기 요약" />
      {!game.matches.length && <p>아직 기록된 랭크 경기가 없습니다.</p>}
      <div className="card-export">
        <div>
          <p className="eyebrow">CAREER CARD</p>
          <b>내 선수의 커리어를 PNG로 저장하세요</b>
          <small>역할·주력 실험체·랭크·숙련도·주요 기록을 한 장에 담습니다.</small>
        </div>
        <button onClick={() => saveCareerCard(game)}>커리어 카드 저장</button>
      </div>
      <h2>대회 성적</h2>
      {game.competitionHistory.length ? (
        <div className="competition-list">
          {game.competitionHistory.slice(0, 12).map((record, index) => (
            <span key={index}>
              <b>
                S{record.season} {record.kind} {record.stage}
              </b>
              <small>
                {record.place ? `${record.place}위` : '결과 기록'}
                {record.points ? ` · ${record.points} CP` : ''}
              </small>
            </span>
          ))}
        </div>
      ) : (
        <p>아직 기록된 대회가 없습니다.</p>
      )}
      <h2>커리어 로그</h2>
      <ol>
        {game.history.slice(0, 12).map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ol>
    </section>
  );
}
