import { joinAmateurTeam, joinKel, promoteTeamToKel, type Game } from '../engine/game';
import {
  canJoinAmateurTeam,
  canJoinKel,
  canPromoteTeamToKel,
  seasonQualificationRp,
} from '../engine/careerRules';
import type { TournamentResult } from '../engine/tournament';

type TournamentViewProps = {
  game: Game;
  result: TournamentResult | null;
  onChange: (game: Game) => void;
};

export function TournamentView({ game, result, onChange }: TournamentViewProps) {
  const qualificationRp = seasonQualificationRp(game);
  const competitionName = (kind: Game['competitionHistory'][number]['kind'], stage: number) => {
    if (kind !== '지역 컵') return kind;
    return stage === 1 ? '대통령배 KeG 지역대표선발전' : '대통령배 KeG 전국결선';
  };

  return (
    <section className="tournament panel">
      <h2>커리어 경쟁 무대</h2>
      <div className="career-progress">
        <b>인지도 {game.fame}/100</b>
        <b>시즌 대회 기준 {qualificationRp} RP</b>
        <span>
          {game.teamName ?? '무소속'} · {game.careerLeague}
          {game.careerLeague === 'KEL' ? ' · 4인 로스터' : ''}
        </span>
        <small>미스릴 전국대회 → 팀 결성 → 데미갓 마스터즈 → KEL</small>
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
        <button disabled={!canJoinAmateurTeam(game)} onClick={() => onChange(joinAmateurTeam(game))}>
          <b>아마추어 팀 합류</b>
          <small>미스릴 이상 · 인지도 5 · 팀 결성</small>
        </button>
        <button disabled={!canPromoteTeamToKel(game)} onClick={() => onChange(promoteTeamToKel(game))}>
          <b>팀 전체 KEL 승격</b>
          <small>아마추어 팀 · 인지도 60 · CP 600</small>
        </button>
        <button
          disabled={!canJoinKel(game) || game.careerLeague === 'KEL'}
          onClick={() => onChange(joinKel(game))}
        >
          <b>KEL 4인 로스터 합류</b>
          <small>인지도 50 · 마스터즈 CP 400</small>
        </button>
      </div>
      <h2>자동 참가 결과</h2>
      <p>자격을 충족한 대회는 시즌 진행과 함께 자동 처리됩니다. 아래에는 최근 결과만 표시합니다.</p>
      <div className="competition-results">
        {game.competitionHistory.slice(0, 8).map((record, index) => (
          <article key={record.season + '-' + record.kind + '-' + record.stage + '-' + index}>
            <span>
              <small>S{record.season}</small>
              {competitionName(record.kind, record.stage)}
            </span>
            <b>{record.place > 0 ? record.place + '위' : '진출 실패'}</b>
            {record.points > 0 && <small>{record.points} CP</small>}
          </article>
        ))}
        {!game.competitionHistory.length && (
          <small>미스릴 달성 후 전국 아마추어 대회부터 자동 참가합니다.</small>
        )}
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
                  <td data-label="라운드">{round.round}R</td>
                  <td data-label="선택 실험체">{round.pick}</td>
                  <td data-label="순위">{round.place}위</td>
                  <td data-label="체크포인트">
                    {round.checkpoint ? (round.eligible ? '보유' : '미보유') : '-'}
                  </td>
                  <td data-label="이번 R 밴">{round.banned.length ? round.banned.join(' · ') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </section>
  );
}
