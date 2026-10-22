import { buyEquipment, equipmentCatalog, type Game } from '../engine/game';
import { saveCareerCard } from '../utils/careerCard';

type GameViewProps = { game: Game; onChange: (game: Game) => void };

export function EquipmentShop({ game, onChange }: GameViewProps) {
  return (
    <section className="shop panel">
      <h2>커리어 장비 상점</h2>
      <p>
        커리어 크레딧은 이 팬게임의 창작 재화입니다. 랭크 경기로 얻고, 구매한 장비는 영구 능력치 보너스를
        제공합니다.
      </p>
      <div className="shop-grid">
        {equipmentCatalog.map((item) => {
          const owned = game.equipment.includes(item.id);
          return (
            <article key={item.id}>
              <p className="eyebrow">
                {item.stat.toUpperCase()} +{item.amount}
              </p>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
              <b>{item.cost.toLocaleString()} C</b>
              <button
                disabled={owned || game.credits < item.cost}
                onClick={() => onChange(buyEquipment(game, item.id))}
              >
                {owned ? '장착 완료' : game.credits < item.cost ? '크레딧 부족' : '구매·장착'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function PlayerRecords({ game }: Pick<GameViewProps, 'game'>) {
  return (
    <section className="panel">
      <h2>최근 랭크 경기</h2>
      {game.matches.length ? (
        <table>
          <thead>
            <tr>
              <th>실험체</th>
              <th>순위</th>
              <th>킬</th>
              <th>입장료</th>
              <th>획득 RP</th>
              <th>순 RP</th>
            </tr>
          </thead>
          <tbody>
            {game.matches.map((match, index) => (
              <tr key={index}>
                <td>{match.name}</td>
                <td>{match.place}위</td>
                <td>{match.kills}</td>
                <td>{match.fee ?? 0}</td>
                <td>{match.gross ?? match.rp}</td>
                <td className={match.rp >= 0 ? 'up' : 'down'}>
                  {match.rp >= 0 ? '+' : ''}
                  {match.rp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>아직 기록된 경기가 없습니다.</p>
      )}
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

export function GameGuide() {
  return (
    <section className="panel">
      <h2>공식 대회 규칙 · 2026 확인</h2>
      <p>
        <b>마스터즈 S11~12:</b> 시즌당 3개 페이즈, 서킷 포인트 상위 7팀 + LCQ 1팀이 8팀 시즌 파이널에
        진출합니다. KEL 출전 선수는 참가할 수 없습니다.
      </p>
      <p>
        <b>랭크 3인 스쿼드:</b> 주간 랭크 집중은 4판을 진행합니다. 매 판 시작 시 현재 RP 구간의 1/3인 파티
        입장료를 차감하고, 순위·처치·생존 기반 게임용 점수를 더한 순 RP를 기록합니다.
      </p>
      <p>
        <b>2026 KEL:</b> 16개 지역 대표팀이 오프닝 위크, 서킷 1~4, 미드시즌 컵, 내셔널 챔피언십을 치릅니다.
        2-PICK-CAP은 KEL 결승에만 적용하며, 한 팀이 한 실험체를 최대 두 번 선택하는 규칙입니다. 마스터즈는
        같은 라운드의 전체 선택 수에 따라 다음 라운드부터 모든 팀에 밴이 적용되는 3픽밴입니다.
      </p>
      <p>
        <b>순차 체크포인트:</b> 4R까지 비활성, 5R 상위 2팀→6R 3팀→7R 5팀→8R 7팀→9R 전 팀 순으로 부여되며,
        체크포인트 보유 팀이 최종 생존하면 우승합니다.
      </p>
      <p className="official-note">
        랭크 입장료 출처: 이터널 리턴 고객지원 ‘랭크 운영 방식 및 입장료’(2026-08-19). 티어별 상위 랭크 컷은
        커리어 시뮬레이션용으로 설정했습니다.
      </p>
      <p className="official-note">
        출처: 이터널 리턴 공식 시즌 11 이스포츠 개편 및 2026 KEL 운영 안내. 구현 결과는 게임용
        시뮬레이션입니다.
      </p>
    </section>
  );
}
