import { joinAmateurTeam, joinKel, playCommunityCup, promoteTeamToKel, type Game } from '../engine/game';
import {
  canEnterCommunityCup,
  canJoinAmateurTeam,
  canJoinKel,
  canPromoteTeamToKel,
} from '../engine/careerRules';
import type { TournamentKind, TournamentResult } from '../engine/tournament';

type TournamentViewProps = {
  game: Game;
  result: TournamentResult | null;
  mastersEligible: boolean;
  kelEligible: boolean;
  onChange: (game: Game) => void;
  onTournament: (kind: TournamentKind) => void;
};

export function TournamentView({
  game,
  result,
  mastersEligible,
  kelEligible,
  onChange,
  onTournament,
}: TournamentViewProps) {
  return (
    <section className="tournament panel">
      <h2>커리어 경쟁 무대</h2>
      <div className="career-progress">
        <b>명성 {game.fame}</b>
        <span>
          {game.teamName ?? '무소속'} · {game.careerLeague}
          {game.careerLeague === 'KEL' ? ' · 4인 로스터' : ''}
        </span>
        <small>지역 컵 → 팀 합류 → 마스터즈 → KEL 로스터</small>
      </div>
      <div className="roster-card">
        <b>{game.teamName ?? '팀 미정'}</b>
        <div className="member-grid">
          <span>
            <b>{game.name}</b>
            <small>
              {game.main} · {game.role} · 주전
            </small>
          </span>
          {game.teamMembers.map((member, index) => (
            <span key={`${member.experiment}-${index}`}>
              <b>{member.nickname}</b>
              <small>
                {member.experiment} · {member.role} · 실력 {member.skill} · 폼 {member.form}
                {member.starter ? ' · 주전' : ' · 후보'}
              </small>
            </span>
          ))}
        </div>
        <small>
          {game.careerLeague === 'KEL' ? 'KEL 4인 로스터' : '현재 3인 스쿼드'} · 우승 {game.trophies}회
        </small>
      </div>
      <div className="tournament-buttons">
        <button disabled={!canEnterCommunityCup(game)} onClick={() => onChange(playCommunityCup(game))}>
          <b>지역 컵 참가</b>
          <small>브론즈 이상 · 시즌 {game.seasonCupEntries}/2회 참가</small>
        </button>
        <button disabled={!canJoinAmateurTeam(game)} onClick={() => onChange(joinAmateurTeam(game))}>
          <b>아마추어 팀 합류</b>
          <small>명성 45 · 마스터즈 도전 팀 결성</small>
        </button>
        <button disabled={!canPromoteTeamToKel(game)} onClick={() => onChange(promoteTeamToKel(game))}>
          <b>팀 전체 KEL 승격</b>
          <small>아마추어 팀 · 명성 240 · CP 600</small>
        </button>
        <button
          disabled={!canJoinKel(game) || game.careerLeague === 'KEL'}
          onClick={() => onChange(joinKel(game))}
        >
          <b>KEL 4인 로스터 합류</b>
          <small>명성 180 · 마스터즈 CP 400</small>
        </button>
      </div>
      <h2>공식 형식 대회 시뮬레이션</h2>
      <p>
        공식 운영 구조를 바탕으로 한 게임용 결과입니다. 실제 대회 기록이나 선수 데이터를 재현하지 않습니다.
      </p>
      <div className="tournament-buttons">
        <button disabled={!mastersEligible} onClick={() => onTournament('masters')}>
          <b>마스터즈 페이즈</b>
          <small>
            {mastersEligible ? '3픽밴 · 페이즈 결과와 서킷 포인트' : '골드 · 명성 75 · 아마추어 팀 필요'}
          </small>
        </button>
        <button disabled={!kelEligible} onClick={() => onTournament('kel')}>
          <b>KEL 순차 체크포인트 결승</b>
          <small>{kelEligible ? '2-PICK-CAP · 순차 체크포인트' : 'KEL 4인 로스터 등록 필요'}</small>
        </button>
      </div>
      {result && (
        <article className="result">
          <p className="eyebrow">{result.kind === 'masters' ? 'MASTERS PHASE' : 'KEL FINAL'}</p>
          <h2>우승: {result.champion}</h2>
          <p>
            내 최고 순위 <b>{result.playerPlace}위</b> · 획득 서킷 포인트 <b>{result.circuitPoints}</b>
          </p>
          <p>{result.note}</p>
          <table>
            <thead>
              <tr>
                <th>라운드</th>
                <th>선택 실험체</th>
                <th>순위</th>
                <th>체크포인트</th>
                <th>이번 R 밴</th>
              </tr>
            </thead>
            <tbody>
              {result.rounds.map((round) => (
                <tr key={round.round}>
                  <td>{round.round}R</td>
                  <td>{round.pick}</td>
                  <td>{round.place}위</td>
                  <td>{round.checkpoint ? (round.eligible ? '보유' : '미보유') : '-'}</td>
                  <td>{round.banned.length ? round.banned.join(' · ') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}
