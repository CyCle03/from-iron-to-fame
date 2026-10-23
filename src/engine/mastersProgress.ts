import { COMPETITION_RP } from './competitionRules';
import type { Game, MastersSeason, MastersStanding } from './game';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const teamWordsA = ['루미아', '이터널', '네온', '블루', '레드', '실버', '골든', '아스트라'];
const teamWordsB = ['웨이브', '폭스', '블레이즈', '나이츠', '피닉스', '스톰'];
const hash = (text: string) =>
  [...text].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
const seeded = (text: string) => hash(text) / 4294967295;

export function createMastersSeason(season: number, playerTeam: string | null): MastersSeason {
  const playerName = playerTeam ?? '플레이어 팀';
  const rivals = Array.from({ length: 47 }, (_, index) => {
    const generated =
      teamWordsA[index % teamWordsA.length] +
      ' ' +
      teamWordsB[Math.floor(index / teamWordsA.length) % teamWordsB.length];
    return {
      id: 'ai-' + (index + 1),
      name: generated === playerName ? generated + ' B' : generated,
      rating: 46 + Math.round(seeded(season + ':' + index) * 38),
      points: 0,
      wins: 0,
      phasePlaces: [],
      qualification: null as MastersStanding['qualification'],
    };
  });
  return {
    season,
    standings: [
      {
        id: 'player',
        name: playerName,
        rating: 55,
        points: 0,
        wins: 0,
        phasePlaces: [],
        qualification: null,
      },
      ...rivals,
    ],
    lcqWinner: null,
    finalists: [],
    champion: null,
    playerFinalPlace: null,
  };
}
const mastersPointsForPlace = (place: number) =>
  place === 1 ? 400 : place === 2 ? 345 : place === 3 ? 290 : place === 4 ? 245 : place <= 8 ? 200 : 0;
const rankMasters = (standings: MastersStanding[]) =>
  [...standings].sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name, 'ko'));
export function recordMastersPhase(g: Game, points: number, place = 0): Game {
  if (g.careerLeague === '솔로' || g.rp < COMPETITION_RP.masters || (g.fame ?? 0) < 15)
    return { ...g, notices: ['마스터즈 레이팅 컷: 데미갓 이상 · 인지도 15 · 소속 팀'] };
  if (g.careerLeague === 'KEL') return { ...g, notices: ['KEL 등록 선수는 마스터즈에 참가할 수 없습니다.'] };
  if ((g.mastersPhase ?? 0) >= 3)
    return { ...g, notices: ['이번 시즌 마스터즈 3개 페이즈를 모두 완료했습니다.'] };
  const n = structuredClone(g);
  n.careerLeague = '마스터즈';
  n.mastersPhase = (n.mastersPhase ?? 0) + 1;
  n.mastersPoints = (n.mastersPoints ?? 0) + points;
  const awareness = place === 1 ? 8 : place <= 3 ? 6 : place <= 8 ? 4 : 2;
  n.fame = clamp((n.fame ?? 0) + awareness);
  n.credits += 150 + points;
  const season =
    n.mastersSeason?.season === n.season ? n.mastersSeason : createMastersSeason(n.season, n.teamName);
  season.standings = season.standings.map((team) => {
    if (team.id === 'player')
      return {
        ...team,
        name: n.teamName ?? team.name,
        rating: Math.round(Object.values(n.stats).reduce((a, b) => a + b, 0) / 8),
        points: team.points + points,
        wins: team.wins + (place === 1 ? 1 : 0),
        phasePlaces: [...team.phasePlaces, place],
      };
    const noise = seeded(n.season + ':' + n.mastersPhase + ':' + team.id) * 34 - 17;
    const aiPlace = Math.max(1, Math.min(48, Math.round(49 - (team.rating + noise) / 2)));
    const earned = mastersPointsForPlace(aiPlace);
    return {
      ...team,
      points: team.points + earned,
      wins: team.wins + (aiPlace === 1 ? 1 : 0),
      phasePlaces: [...team.phasePlaces, aiPlace],
    };
  });
  if (n.mastersPhase === 3) {
    const ordered = rankMasters(season.standings);
    const direct = new Set(ordered.slice(0, 7).map((team) => team.id));
    season.standings = season.standings.map((team) => ({
      ...team,
      qualification: direct.has(team.id) ? '직행' : team.id === 'player' ? 'LCQ' : '탈락',
    }));
  }
  n.mastersSeason = season;
  n.competitionHistory = [
    { season: n.season, kind: '마스터즈', stage: n.mastersPhase, place, points },
    ...(n.competitionHistory ?? []),
  ];
  n.history.unshift('마스터즈 페이즈 ' + n.mastersPhase + ' 완료 · 서킷 포인트 +' + points);
  n.notices = ['마스터즈 페이즈 ' + n.mastersPhase + ' 완료! 누적 서킷 포인트 ' + n.mastersPoints];
  return n;
}
export function finishMastersSeason(g: Game): Game {
  if (g.mastersPhase < 3) return { ...g, notices: ['마스터즈 3개 페이즈를 먼저 완료해야 합니다.'] };
  if (g.mastersSeason.champion) return { ...g, notices: ['이번 시즌 파이널이 이미 종료되었습니다.'] };
  const n = structuredClone(g);
  const season = n.mastersSeason;
  const ordered = rankMasters(season.standings);
  const direct = ordered.slice(0, 7);
  const player = ordered.find((team) => team.id === 'player')!;
  const lcqPool = ordered.slice(7);
  const lcqWinner =
    player.qualification === 'LCQ' && ordered.indexOf(player) < 16
      ? player
      : lcqPool.sort(
          (a, b) =>
            b.rating +
            seeded(n.season + ':lcq:' + b.id) * 20 -
            (a.rating + seeded(n.season + ':lcq:' + a.id) * 20),
        )[0];
  season.lcqWinner = lcqWinner.name;
  season.finalists = [...direct.map((team) => team.name), lcqWinner.name];
  season.standings = season.standings.map((team) => ({
    ...team,
    qualification: direct.some((x) => x.id === team.id) ? '직행' : team.id === lcqWinner.id ? 'LCQ' : '탈락',
  }));
  const finalists = [...direct, lcqWinner].sort(
    (a, b) =>
      b.rating +
      b.points / 30 +
      seeded(n.season + ':final:' + b.id) * 25 -
      (a.rating + a.points / 30 + seeded(n.season + ':final:' + a.id) * 25),
  );
  season.champion = finalists[0].name;
  const playerPlace = finalists.findIndex((team) => team.id === 'player');
  season.playerFinalPlace = playerPlace < 0 ? null : playerPlace + 1;
  if (season.playerFinalPlace === 1) {
    n.trophies++;
    n.awards = [`S${n.season} 마스터즈 파이널 MVP`, ...n.awards];
  } else if (season.playerFinalPlace && season.playerFinalPlace <= 3)
    n.awards = [`S${n.season} 마스터즈 시즌 베스트`, ...n.awards];
  n.fame = clamp(
    n.fame +
      (season.playerFinalPlace === 1
        ? 15
        : season.playerFinalPlace && season.playerFinalPlace <= 3
          ? 10
          : season.playerFinalPlace
            ? 6
            : 2),
  );
  n.competitionHistory = [
    { season: n.season, kind: '시즌 파이널', stage: 1, place: season.playerFinalPlace ?? 0, points: 0 },
    { season: n.season, kind: 'LCQ', stage: 1, place: lcqWinner.id === 'player' ? 1 : 0, points: 0 },
    ...n.competitionHistory,
  ];
  n.history.unshift(
    '마스터즈 시즌 파이널 · 우승 ' +
      season.champion +
      (season.playerFinalPlace ? ' · 최종 ' + season.playerFinalPlace + '위' : ' · 본선 진출 실패'),
  );
  n.notices = ['시즌 파이널 종료 · 우승 ' + season.champion];
  return n;
}
