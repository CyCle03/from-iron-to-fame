import type { RandomSource } from './random';
import { COMPETITION_RP } from './competitionRules';
import { rankEntryFee, rankFor, rankScoreFor, startingRp } from './rank';
import { summarizeMatches } from './matchSummary';
import { nextWeek } from './seasonProgress';

export type Rank =
  | '아이언'
  | '브론즈'
  | '실버'
  | '골드'
  | '플래티넘'
  | '다이아몬드'
  | '메테오라이트'
  | '미스릴'
  | '데미갓'
  | '이터니티';
export type Background =
  '일반 유저' | '피지컬 괴물' | '이론 분석가' | '원챔 장인' | '아마추어 경험자' | '복귀 유망주';
export type Role = '탱커' | '근거리 딜러' | '원거리 딜러' | '스킬 증폭 딜러' | '서포터' | '하이퍼캐리';
export type ExperimentTag = '하이퍼캐리';
export const experimentTags: Record<ExperimentTag, string[]> = {
  하이퍼캐리: [
    '쇼이치',
    '타지아',
    '이바',
    '알렉스',
    '아델라',
    '실비아',
    '마르티나',
    '칼라',
    '띠아',
    '이렘',
    '슈린',
  ],
};
export const hasExperimentTag = (name: string, tag: ExperimentTag) => experimentTags[tag].includes(name);
/** 91-character S12 roster. One primary career role per experiment; weapon variants are collapsed. */
export const roleExperiments: Record<Role, string[]> = {
  탱커: [
    '매그너스',
    '현우',
    '쇼우',
    '레녹스',
    '일레븐',
    '마이',
    '엘레나',
    '마커스',
    '에스텔',
    '알론소',
    '케네스',
    '세레스',
  ],
  '근거리 딜러': [
    '재키',
    '피오라',
    '리 다이린',
    '유키',
    '키아라',
    '루크',
    '캐시',
    '레온',
    '니키',
    '얀',
    '다니엘',
    '카밀로',
    '에키온',
    '에이든',
    '라우라',
    '펠릭스',
    '피올로',
    '아이작',
    '이안',
    '바냐',
    '데비 마를렌',
    '아비게일',
    '다르코',
    '가넷',
    '히스이',
    '이슈트반',
    '슈린',
    '블레어',
    '미르카',
    '펜리르',
    '비형',
  ],
  '원거리 딜러': [
    '아야',
    '나딘',
    '하트',
    '로지',
    '버니스',
    '리오',
    '윌리엄',
    '제니',
    '클로에',
    '칼라',
    '카티야',
    '츠바메',
    '테오도르',
  ],
  '스킬 증폭 딜러': [
    '자히르',
    '아이솔',
    '혜진',
    '시셀라',
    '아드리아나',
    '엠마',
    '아델라',
    '바바라',
    '수아',
    '나타폰',
    '비앙카',
    '셀린',
    '띠아',
    '아디나',
    '헤이즈',
    '르노어',
    '유민',
    '유스티나',
    '니아',
    '헨리',
    '코렐라인',
    '루치아',
    '크레이버',
    '아르다',
  ],
  서포터: ['요한', '프리야', '레니', '샬럿'],
  하이퍼캐리: ['쇼이치', '이바', '알렉스', '실비아', '마르티나', '타지아', '이렘'],
};
export type Equipment = {
  id: string;
  name: string;
  cost: number;
  stat: keyof Stats;
  amount: number;
  desc: string;
};
export const equipmentCatalog: Equipment[] = [
  {
    id: 'aim',
    name: '정밀 조준 모듈',
    cost: 450,
    stat: 'physical',
    amount: 3,
    desc: '손끝 감각을 보강합니다.',
  },
  {
    id: 'route',
    name: '루트 분석 태블릿',
    cost: 550,
    stat: 'macro',
    amount: 4,
    desc: '파밍·운영 분석 효율을 높입니다.',
  },
  {
    id: 'comms',
    name: '팀 보이스 키트',
    cost: 600,
    stat: 'teamwork',
    amount: 4,
    desc: '팀 합동 연습의 호흡을 보강합니다.',
  },
  {
    id: 'focus',
    name: '집중력 부스터',
    cost: 700,
    stat: 'focus',
    amount: 4,
    desc: '중요한 교전의 집중력을 끌어올립니다.',
  },
];
const equipmentById = new Map(equipmentCatalog.map((item) => [item.id, item]));
export const equipmentBonus = (g: { equipment?: string[] }) =>
  (g.equipment ?? []).reduce((sum, id) => sum + (equipmentById.get(id)?.amount ?? 0), 0);
export type Action = 'rank' | 'physical' | 'macro' | 'specialist' | 'review' | 'team' | 'rest';
export type StatKey = keyof Stats;
export type Stats = {
  physical: number;
  combat: number;
  macro: number;
  judgement: number;
  teamwork: number;
  mental: number;
  focus: number;
  adaptability: number;
};
export type Match = {
  place: number;
  kills: number;
  tk?: number;
  downs?: number;
  preventionDowns?: number;
  terminates?: number;
  rp: number;
  name: string;
  fee?: number;
  gross?: number;
};
export type SeasonSummary = {
  season: number;
  plan: Action;
  rpBefore: number;
  rpAfter: number;
  rankBefore: Rank;
  rankAfter: Rank;
  fameGained: number;
  matches: number;
  bestPlace: number | null;
  tournamentEvents: number;
  seasonCondition: '집중 운영' | '균형 운영' | '회복 운영';
  conditionNote: string;
  autoRecoveryWeeks: number;
  averagePlace: number;
  averageTk: number;
  wins: number;
  top3: number;
  totalRp: number;
};
export type SeasonTurningPoint = 'pool' | 'team' | 'analysis';
export type TeamMember = {
  nickname: string;
  experiment: string;
  role: Role;
  skill: number;
  form: number;
  fatigue: number;
  starter: boolean;
};
export type CompetitionRecord = {
  season: number;
  kind: '지역 컵' | '마스터즈' | 'LCQ' | '시즌 파이널' | 'KEL';
  stage: number;
  place: number;
  points: number;
};
export type MastersStanding = {
  id: string;
  name: string;
  rating: number;
  points: number;
  wins: number;
  phasePlaces: number[];
  qualification: '직행' | 'LCQ' | '탈락' | null;
};
export type MastersSeason = {
  season: number;
  standings: MastersStanding[];
  lcqWinner: string | null;
  finalists: string[];
  champion: string | null;
  playerFinalPlace: number | null;
};
export type SeasonMeta = { season: number; name: string; strongRoles: Role[]; description: string };
export type CareerLeague = '솔로' | '아마추어' | '마스터즈' | 'KEL';
export type TeamContract = {
  team: string;
  league: Exclude<CareerLeague, '솔로'>;
  salary: number;
  seasonsRemaining: number;
};
export type ScoutOffer = TeamContract & { signingBonus: number };
export type CareerTotals = {
  events: number;
  wins: number;
  podiums: number;
  bestPlace: number | null;
  representative: string;
};
export type HallOfFameCategory = '스타즈' | '히어로즈' | '아너스';
export const CURRENT_SAVE_VERSION = 7 as const;
export type Game = {
  lastSeasonPlan: Action;
  trainingFocus: StatKey[];
  seasonEvent: string;
  turningPointAvailable: boolean;
  teammateRoles: Role[];
  teammateExperiments: string[];
  experimentPool: string[];
  seasonMeta: SeasonMeta;
  contract: TeamContract | null;
  scoutOffers: ScoutOffer[];
  teamHistory: string[];
  awards: string[];
  retired: boolean;
  retirementSeason: number | null;
  signatureComp: string | null;
  duoSynergy: string | null;
  fame: number;
  teamName: string | null;
  careerLeague: CareerLeague;
  communityCups: number;
  seasonCupEntries: number;
  kelRosterSize: number;
  trophies: number;
  hallOfFame: boolean;
  hallOfFameHonors: HallOfFameCategory[];
  starsSelections: number;
  lastStarsSeason: number | null;
  lastSeasonSummary: SeasonSummary | null;
  teamMembers: TeamMember[];
  competitionHistory: CompetitionRecord[];
  mastersSeason: MastersSeason;
  version: typeof CURRENT_SAVE_VERSION;
  name: string;
  rank: Rank;
  role: Role;
  rp: number;
  credits: number;
  equipment: string[];
  mastersPoints: number;
  mastersPhase: number;
  kelStage: number;
  week: number;
  season: number;
  background: Background;
  main: string;
  stats: Stats;
  fatigue: number;
  morale: number;
  mastery: Record<string, number>;
  actionPoints: number;
  history: string[];
  matches: Match[];
  notices: string[];
};
export const ranks: Rank[] = [
  '아이언',
  '브론즈',
  '실버',
  '골드',
  '플래티넘',
  '다이아몬드',
  '메테오라이트',
  '미스릴',
  '데미갓',
  '이터니티',
];
export function validateGameState(g: Game): string[] {
  const errors: string[] = [];
  const bounded: [string, number][] = [
    ...Object.entries(g.stats),
    ['fatigue', g.fatigue],
    ['morale', g.morale],
    ['fame', g.fame],
    ...Object.entries(g.mastery),
  ];
  for (const [key, value] of bounded)
    if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(key + ' 범위 오류');
  if (!Number.isFinite(g.rp) || g.rp < 0) errors.push('RP 오류');
  if (!Number.isFinite(g.credits) || g.credits < 0) errors.push('크레딧 오류');
  if (g.week < 1 || g.week > 12) errors.push('주차 오류');
  if (new Set(g.experimentPool).size !== g.experimentPool.length) errors.push('실험체 풀 중복');
  if (!g.experimentPool.includes(g.main)) errors.push('주력 실험체 누락');
  if (g.teamMembers.length && g.teamMembers.filter((member) => member.starter).length !== 2)
    errors.push('주전 로스터 인원 오류');
  return errors;
}
export const backgrounds: Record<Background, { desc: string; buffs: Partial<Stats> }> = {
  '일반 유저': { desc: '고른 출발선. 어떤 길이든 열려 있습니다.', buffs: {} },
  '피지컬 괴물': {
    desc: '교전은 자신 있지만 콜은 아직 거칩니다.',
    buffs: { physical: 10, combat: 8, macro: -5, teamwork: -4 },
  },
  '이론 분석가': {
    desc: '판은 읽지만 손이 조금 느립니다.',
    buffs: { macro: 10, judgement: 8, physical: -5, combat: -4 },
  },
  '원챔 장인': { desc: '주력 실험체와 함께라면 무섭습니다.', buffs: { combat: 5, adaptability: -7 } },
  '아마추어 경험자': { desc: '대회장의 호흡을 이미 압니다.', buffs: { teamwork: 9, mental: 5 } },
  '복귀 유망주': { desc: '감각은 남아 있지만 메타는 새롭습니다.', buffs: { focus: 7, adaptability: -5 } },
};
export const characters = Object.values(roleExperiments).flat();
export const characterSet = new Set(characters);
const roleByExperiment = new Map<string, Role>();
for (const [role, names] of Object.entries(roleExperiments) as [Role, string[]][])
  for (const name of names) roleByExperiment.set(name, role);
export const roleDescriptions: Record<Role, string> = {
  탱커: '전선을 만들고 아군의 딜각을 여는 역할',
  '근거리 딜러': '근접 교전과 진입으로 압박하는 역할',
  '원거리 딜러': '지속적인 원거리 화력을 담당하는 역할',
  '스킬 증폭 딜러': '스킬 연계와 순간 화력을 담당하는 역할',
  서포터: '회복·보호·강화로 팀을 지원하는 역할',
  하이퍼캐리: '높은 숙련도와 팀 자원을 화력으로 바꾸는 역할',
};
export const roleForExperiment = (name: string): Role | undefined => roleByExperiment.get(name);
export const seasonInfo = (season: number) => ({
  year: 2026 + Math.floor((season - 11) / 3),
  number: ((((season - 11) % 3) + 3) % 3) + 1,
});
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const statLabels: Record<StatKey, string> = {
  physical: '피지컬',
  combat: '교전',
  macro: '운영',
  judgement: '판단',
  teamwork: '팀워크',
  mental: '멘탈',
  focus: '집중력',
  adaptability: '적응력',
};
const teamWordsA = ['루미아', '이터널', '네온', '블루', '레드', '실버', '골든', '아스트라'];
const teamWordsB = ['웨이브', '폭스', '블레이즈', '나이츠', '피닉스', '스톰'];
const hash = (text: string) =>
  [...text].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
const seeded = (text: string) => hash(text) / 4294967295;
const metaNames = ['전면 교전 메타', '원거리 포킹 메타', '운영 중심 메타', '보호 조합 메타'];
export function createSeasonMeta(season: number): SeasonMeta {
  const rotations: Role[][] = [
    ['탱커', '근거리 딜러'],
    ['원거리 딜러', '스킬 증폭 딜러'],
    ['스킬 증폭 딜러', '서포터'],
    ['탱커', '서포터'],
  ];
  const index = Math.floor(seeded('meta:' + season) * rotations.length);
  const strongRoles = rotations[index];
  return {
    season,
    name: metaNames[index],
    strongRoles,
    description: strongRoles.join(' · ') + ' 역할의 대회 전력이 상승합니다.',
  };
}
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
export function createGame(
  name: string,
  rank: Rank,
  background: Background,
  roleOrMain: Role | string,
  maybeMain?: string,
  trainingFocus: StatKey[] = ['physical', 'macro'],
  random: RandomSource = Math.random,
): Game {
  const memberNames = ['루미', '노바', '에코', '제로', '하운드', '코멧'];
  const main = maybeMain ?? (roleOrMain as string);
  const role = (
    maybeMain
      ? roleOrMain
      : (Object.keys(roleExperiments).find((key) => roleExperiments[key as Role].includes(main)) ??
        '근거리 딜러')
  ) as Role;
  const base = 38 + ranks.indexOf(rank) * 5;
  const stats = {
    physical: base,
    combat: base,
    macro: base,
    judgement: base,
    teamwork: base,
    mental: base,
    focus: base,
    adaptability: base,
  };
  for (const [k, v] of Object.entries(backgrounds[background].buffs))
    stats[k as keyof Stats] = clamp(stats[k as keyof Stats] + (v ?? 0));
  let teammateRoles: Role[] = hasExperimentTag(main, '하이퍼캐리')
    ? random() < 0.65
      ? ['서포터', '탱커']
      : ['근거리 딜러', '원거리 딜러']
    : random() < 0.3
      ? ['서포터', '탱커']
      : ['근거리 딜러', '원거리 딜러'];
  let teammateExperiments = teammateRoles.map(
    (r) => roleExperiments[r][Math.floor(random() * roleExperiments[r].length)],
  );
  const signaturePresets: Record<string, { name: string; members: string[] }> = {
    쇼이치: { name: '마이 · 레니 · 쇼이치', members: ['마이', '레니'] },
    타지아: { name: '[대회] 니키 · 타지아 · 샬럿', members: ['니키', '샬럿'] },
  };
  const preset = signaturePresets[main];
  const signatureComp = preset && random() < 0.35 ? preset.name : null;
  if (signatureComp) {
    teammateExperiments = preset.members;
    teammateRoles = preset.members.map(
      (member) =>
        (Object.keys(roleExperiments).find((key) => roleExperiments[key as Role].includes(member)) ??
          '근거리 딜러') as Role,
    );
  }
  const duo = verifiedDuoSynergies[main];
  const duoSynergy = duo && teammateExperiments.includes(duo.partner) ? duo.name : null;
  const teamMembers = teammateExperiments.map((experiment, i) => ({
    nickname: memberNames[i],
    experiment,
    role: teammateRoles[i],
    skill: 42 + Math.floor(random() * 14),
    form: 55,
    fatigue: 10,
    starter: true,
  }));
  const alternatives = roleExperiments[role].filter((name) => name !== main).slice(0, 2);
  const experimentPool = [main, ...alternatives];
  const mastery = Object.fromEntries(
    experimentPool.map((name, index) => [name, index === 0 ? 28 : 18 - index * 4]),
  );
  return {
    lastSeasonPlan: 'rank',
    trainingFocus,
    teammateRoles,
    teammateExperiments,
    experimentPool,
    seasonMeta: createSeasonMeta(11),
    contract: null,
    scoutOffers: [],
    teamHistory: [],
    awards: [],
    retired: false,
    retirementSeason: null,
    signatureComp,
    duoSynergy,
    fame: 0,
    teamName: null,
    careerLeague: '솔로',
    communityCups: 0,
    seasonCupEntries: 0,
    kelRosterSize: 0,
    trophies: 0,
    hallOfFame: false,
    hallOfFameHonors: [],
    starsSelections: 0,
    lastStarsSeason: null,
    lastSeasonSummary: null,
    teamMembers,
    competitionHistory: [],
    mastersSeason: createMastersSeason(11, null),
    seasonEvent: '시즌 시작 이벤트: 코치진이 성장 중점을 점검했습니다.',
    turningPointAvailable: false,
    version: CURRENT_SAVE_VERSION,
    name,
    rank,
    role,
    rp: startingRp(rank),
    credits: 1200,
    equipment: [],
    mastersPoints: 0,
    mastersPhase: 0,
    kelStage: 0,
    week: 1,
    season: 11,
    background,
    main,
    stats,
    fatigue: 12,
    morale: 58,
    mastery,
    actionPoints: 3,
    history: ['루미아 섬에 새로운 선수가 도착했습니다.'],
    matches: [],
    notices: ['시즌 11 MVP: 랭크·훈련·휴식을 조합해 당신만의 커리어를 시작하세요.'],
  };
}
export const hyperCarryTankers = ['쇼우', '레녹스', '일레븐', '마이', '에스텔', '알론소', '케네스', '세레스'];
const verifiedDuoSynergies: Record<string, { partner: string; name: string }> = {
  슈린: { partner: '레니', name: '슈린 · 레니' },
  제니: { partner: '샬럿', name: '제니 · 샬럿' },
  재키: { partner: '아르다', name: '재키 · 아르다' },
  레녹스: { partner: '이바', name: '레녹스 · 이바' },
  이렘: { partner: '엘레나', name: '이렘 · 엘레나' },
};
export function act(g: Game, a: Action, random: RandomSource = Math.random): Game {
  if (g.actionPoints < 1) return { ...g, notices: ['이번 주 행동력이 없습니다. 주를 넘겨주세요.'] };
  const n = structuredClone(g);
  n.actionPoints--;
  const s = n.stats;
  const gain = (key: keyof Stats, amount: number) => (s[key] = clamp(s[key] + amount * (1 - s[key] / 140)));
  const log = (t: string) => n.history.unshift(`S${n.season} ${n.week}주 · ${t}`);
  if (a === 'rest') {
    n.fatigue = clamp(n.fatigue - 24);
    n.morale = clamp(n.morale + 8);
    log('휴식으로 컨디션을 회복했습니다.');
  }
  if (a === 'physical') {
    gain('physical', 3);
    gain('combat', 2);
    n.fatigue += 12;
    log('피지컬 훈련: 손끝 감각이 날카로워졌습니다.');
  }
  if (a === 'macro') {
    gain('macro', 3);
    gain('judgement', 2);
    n.fatigue += 9;
    log('리플레이 분석: 다음 동선이 보이기 시작합니다.');
  }
  if (a === 'specialist') {
    n.mastery[n.main] = clamp((n.mastery[n.main] ?? 0) + 7);
    gain('focus', 1);
    n.fatigue += 11;
    log(`${n.main} 집중 연습: 숙련도가 올랐습니다.`);
  }
  if (a === 'review') {
    gain('adaptability', 2);
    gain('mental', 2);
    n.fatigue += 5;
    log('리플레이 분석: 실수를 다음 판의 무기로 바꿨습니다.');
  }
  if (a === 'team') {
    gain('teamwork', 3);
    n.morale = clamp(n.morale + 3);
    n.fatigue += 9;
    n.teamMembers = (n.teamMembers ?? []).map((member) =>
      member.starter
        ? { ...member, form: clamp(member.form + 5), fatigue: clamp(member.fatigue + 6) }
        : { ...member, form: clamp(member.form + 1), fatigue: clamp(member.fatigue + 2) },
    );
    log('합동 연습: 주전 로스터의 폼과 팀워크가 올랐습니다.');
  }
  if (a === 'rank') {
    let totalNet = 0,
      totalFee = 0,
      totalKills = 0,
      bestPlace = 8;
    for (let gameNo = 0; gameNo < 8; gameNo++) {
      const fee = rankEntryFee(n.rp);
      const lowTierBoost = n.rp < 600 ? 22 : n.rp < 1400 ? 16 : n.rp < 2400 ? 10 : n.rp < 3600 ? 4 : 0;
      const power =
        lowTierBoost +
        (s.physical + s.combat + s.macro + s.judgement + s.teamwork + s.focus) / 6 +
        (n.mastery[n.main] ?? 0) * 0.18 -
        n.fatigue * 0.28 +
        (random() - 0.5) * 24 +
        equipmentBonus(n) +
        (hasExperimentTag(n.main, '하이퍼캐리') &&
        (n.teammateRoles ?? []).includes('서포터') &&
        !(n.teammateExperiments ?? []).includes('아르다')
          ? 7
          : 0) +
        (hasExperimentTag(n.main, '하이퍼캐리') &&
        (n.teammateRoles ?? []).includes('서포터') &&
        !(n.teammateExperiments ?? []).includes('아르다') &&
        (n.teammateExperiments ?? []).some((x) => hyperCarryTankers.includes(x))
          ? 4
          : 0) +
        (n.signatureComp ? 3 : 0) +
        (n.duoSynergy ? 2 : 0) +
        (n.main === '아르다' &&
        (n.teammateRoles ?? []).includes('탱커') &&
        (n.teammateRoles ?? []).includes('근거리 딜러')
          ? 5
          : 0);
      const place = Math.max(1, Math.min(8, Math.round(9 - power / 12)));
      const kills = Math.max(0, Math.min(8, Math.round((power - 38) / 16 + random() * 2)));
      const downs = Math.max(0, Math.round((power - 40) / 18 + random() * 2));
      const tk = Math.max(kills, Math.min(20, kills + 3 + Math.round(random() * 7)));
      const preventionDowns = random() > 0.68 ? 1 : 0;
      const terminates = preventionDowns && random() > 0.55 ? 1 : 0;
      const gross = rankScoreFor(place, kills, downs, preventionDowns, terminates);
      const delta = gross - fee;
      n.rp = Math.max(0, n.rp + delta);
      n.rank = rankFor(n.rp);
      n.fatigue = clamp(n.fatigue + 3);
      n.mastery[n.main] = clamp((n.mastery[n.main] ?? 0) + 2);
      gain('combat', 0.7 + Math.max(0, kills - 1) * 0.25);
      gain('teamwork', place <= 4 ? 0.7 : 0.3);
      gain('judgement', place <= 3 ? 1 : 0.35);
      gain('mental', delta >= 0 ? 0.55 : -0.25);
      if (kills >= 3) gain('physical', 0.45);
      n.credits += Math.max(20, 55 + kills * 12 + (9 - place) * 15);
      n.matches.unshift({
        place,
        kills,
        tk,
        downs,
        preventionDowns,
        terminates,
        rp: delta,
        name: n.main,
        fee,
        gross,
      });
      totalNet += delta;
      totalFee += fee;
      totalKills += kills;
      bestPlace = Math.min(bestPlace, place);
    }
    n.morale = clamp(n.morale + (totalNet >= 0 ? 4 : -5));
    log(
      `랭크 집중 8판 · 최고 ${bestPlace}위 · ${totalKills}킬 · 입장료 ${totalFee} RP · 순변동 ${totalNet >= 0 ? '+' : ''}${totalNet} RP`,
    );
  }
  for (const key of n.trainingFocus ?? []) gain(key, 0.45);
  n.fatigue = clamp(n.fatigue);
  return n;
}
function simulateSeason(g: Game, a: Action, random: RandomSource): Game {
  const plans: Record<Action, Action[]> = {
    rank: [
      'rank',
      'team',
      'rank',
      'review',
      'rank',
      'rest',
      'rank',
      'physical',
      'rank',
      'team',
      'rank',
      'rank',
    ],
    physical: [
      'physical',
      'rank',
      'physical',
      'review',
      'rest',
      'physical',
      'team',
      'rank',
      'physical',
      'rest',
      'rank',
      'specialist',
    ],
    macro: [
      'macro',
      'rank',
      'review',
      'macro',
      'rest',
      'team',
      'rank',
      'macro',
      'review',
      'rest',
      'rank',
      'specialist',
    ],
    specialist: [
      'specialist',
      'rank',
      'specialist',
      'review',
      'rest',
      'team',
      'specialist',
      'rank',
      'physical',
      'rest',
      'specialist',
      'rank',
    ],
    review: [
      'review',
      'rank',
      'macro',
      'review',
      'rest',
      'team',
      'rank',
      'review',
      'physical',
      'rest',
      'macro',
      'rank',
    ],
    team: [
      'team',
      'rank',
      'review',
      'team',
      'rest',
      'rank',
      'physical',
      'team',
      'rank',
      'rest',
      'review',
      'team',
    ],
    rest: [
      'rest',
      'review',
      'macro',
      'rest',
      'team',
      'rank',
      'rest',
      'physical',
      'review',
      'rest',
      'rank',
      'team',
    ],
  };
  let n = structuredClone(g);
  const startSeason = n.season;
  for (const weekAction of plans[a]) {
    n = act({ ...n, actionPoints: 1 }, weekAction, random);
    if (n.fatigue >= 22 || n.morale <= 35) {
      n.fatigue = clamp(n.fatigue - 12);
      n.morale = clamp(n.morale + 2);
      n.history.unshift(
        'S' +
          n.season +
          ' ' +
          n.week +
          '주 · 자동 회복 배분 · 회복일을 편성해 다음 일정의 경기력을 안정시켰습니다.',
      );
    }
    n = nextWeek(n, random);
  }
  const statKeys: StatKey[] = [
    'physical',
    'combat',
    'macro',
    'judgement',
    'teamwork',
    'mental',
    'focus',
    'adaptability',
  ];
  const old = n.trainingFocus ?? ['physical', 'macro'];
  if (random() < 0.65) {
    const first = statKeys[Math.floor(random() * statKeys.length)];
    const second = statKeys.filter((x) => x !== first)[Math.floor(random() * (statKeys.length - 1))];
    n.trainingFocus = [first, second];
    n.seasonEvent =
      '메타 변화 이벤트: 코치진이 성장 중점을 ' +
      statLabels[first] +
      '·' +
      statLabels[second] +
      '으로 재설정했습니다.';
  } else
    n.seasonEvent =
      '전술 코치 이벤트: 기존 성장 중점 ' + old.map((key) => statLabels[key]).join('·') + '을 유지합니다.';
  n.notices = [startSeason + ' 시즌 완료 · ' + n.seasonEvent];
  n.history.unshift(
    'S' + startSeason + ' 시즌 결산 · ' + a + ' 중심 플랜(랭크·훈련·회복 자동 배분)을 완료했습니다.',
  );
  return n;
}
function createScoutOffers(g: Game): ScoutOffer[] {
  if (g.rp < COMPETITION_RP.teamFormation || g.fame < 5) return [];
  const offers: ScoutOffer[] = [
    {
      team: '네온 폭스',
      league: '아마추어',
      salary: 420 + Math.floor(g.fame / 10) * 10,
      seasonsRemaining: 2,
      signingBonus: 220,
    },
  ];
  if (g.fame >= 30)
    offers.push({
      team: '아스트라 나이츠',
      league: '마스터즈',
      salary: 680 + Math.floor(g.fame / 8) * 10,
      seasonsRemaining: 2,
      signingBonus: 400,
    });
  if (g.fame >= 50 && g.mastersPoints >= 400)
    offers.push({
      team: 'KEL 블루 피닉스',
      league: 'KEL',
      salary: 1050,
      seasonsRemaining: 3,
      signingBonus: 700,
    });
  return offers.filter((offer) => offer.team !== g.teamName);
}
export function runSeason(g: Game, a: Action, random: RandomSource = Math.random): Game {
  const before = { season: g.season, rp: g.rp, rank: g.rank, fame: g.fame, matches: g.matches.length };
  const n = simulateSeason(g, a, random);
  n.lastSeasonPlan = a;
  n.turningPointAvailable = true;
  const recent = n.matches.slice(0, Math.max(0, n.matches.length - before.matches));
  const matchSummary = summarizeMatches(recent);
  const autoRecoveryWeeks = n.history.filter(
    (entry) => entry.startsWith('S' + before.season + ' ') && entry.includes('자동 회복 배분'),
  ).length;
  const seasonCondition =
    recent.length >= 40 ? '집중 운영' : autoRecoveryWeeks >= 3 ? '회복 운영' : '균형 운영';
  const conditionNote =
    seasonCondition === '집중 운영'
      ? '랭크 경기 비중이 높은 시즌입니다. 누적 부담은 다음 시즌 시작 전에 자동 정비됩니다.'
      : seasonCondition === '회복 운영'
        ? '분석과 회복을 우선해 다음 시즌을 위한 기반을 다졌습니다.'
        : '훈련·팀 연습·실전을 균형 있게 배분했습니다.';
  n.lastSeasonSummary = {
    season: before.season,
    plan: a,
    rpBefore: before.rp,
    rpAfter: n.rp,
    rankBefore: before.rank,
    rankAfter: n.rank,
    fameGained: n.fame - before.fame,
    matches: recent.length,
    bestPlace: recent.length ? Math.min(...recent.map((m) => m.place)) : null,
    tournamentEvents: 0,
    seasonCondition,
    conditionNote,
    autoRecoveryWeeks,
    averagePlace: matchSummary.averagePlace,
    averageTk: matchSummary.averageTk,
    wins: matchSummary.wins,
    top3: matchSummary.top3,
    totalRp: matchSummary.totalRp,
  };
  // 피로는 시즌 안에서만 경기력에 반영한다. 다음 시즌에는 자동 정비되어 반복적인 휴식 관리가 필요 없다.
  n.fatigue = 12;
  n.teamMembers = (n.teamMembers ?? []).map((member) => ({
    ...member,
    skill: clamp(member.skill + (a === 'team' ? 3 : 1)),
    form: clamp(48 + random() * 18),
    fatigue: 12,
  }));
  if (n.contract) {
    n.credits += n.contract.salary;
    n.contract.seasonsRemaining--;
    n.history.unshift('시즌 급여 · ' + n.contract.team + ' · ' + n.contract.salary + ' C');
    if (n.contract.seasonsRemaining <= 0) {
      n.history.unshift('계약 만료 · ' + n.contract.team + ' 퇴단 · 자유계약 신분');
      n.contract = null;
      n.teamName = null;
      n.careerLeague = '솔로';
      n.kelRosterSize = 0;
    }
  }
  n.scoutOffers = createScoutOffers(n);
  n.mastersPhase = 0;
  n.mastersPoints = 0;
  n.mastersSeason = createMastersSeason(n.season, n.teamName);
  n.seasonMeta = createSeasonMeta(n.season);
  n.kelStage = 0;
  n.seasonCupEntries = 0;
  n.history.unshift('새 시즌 개막 · ' + n.seasonMeta.name + ' · 마스터즈와 KEL 일정이 초기화되었습니다.');
  return n;
}
export function resolveSeasonTurningPoint(g: Game, choice: SeasonTurningPoint): Game {
  if (!g.turningPointAvailable) return g;
  const n = structuredClone(g);
  if (choice === 'pool') {
    const target = n.experimentPool.find((experiment) => experiment !== n.main) ?? n.main;
    n.mastery[target] = clamp((n.mastery[target] ?? 0) + 7);
    n.stats.adaptability = clamp(n.stats.adaptability + 2);
    n.history.unshift('S' + n.season + ' 전환점 · ' + target + ' 분석을 통해 밴픽 대응 폭을 넓혔습니다.');
    n.notices = ['전환점 완료 · ' + target + ' 숙련도 +7 · 적응력 +2'];
  }
  if (choice === 'team') {
    n.stats.teamwork = clamp(n.stats.teamwork + 4);
    n.morale = clamp(n.morale + 3);
    n.teamMembers = n.teamMembers.map((member) =>
      member.starter ? { ...member, form: clamp(member.form + 4) } : member,
    );
    n.history.unshift('S' + n.season + ' 전환점 · 스쿼드 교전 콜을 맞추며 팀 호흡을 다졌습니다.');
    n.notices = ['전환점 완료 · 팀워크 +4 · 멘탈 +3 · 주전 폼 +4'];
  }
  if (choice === 'analysis') {
    n.stats.macro = clamp(n.stats.macro + 3);
    n.stats.judgement = clamp(n.stats.judgement + 3);
    n.stats.mental = clamp(n.stats.mental + 1);
    n.history.unshift('S' + n.season + ' 전환점 · 안전 구역과 교전 로그를 다시 분석했습니다.');
    n.notices = ['전환점 완료 · 운영 +3 · 판단 +3 · 멘탈 +1'];
  }
  n.turningPointAvailable = false;
  return n;
}

export function buyEquipment(g: Game, id: string): Game {
  const item = equipmentById.get(id);
  if (!item || g.credits < item.cost || (g.equipment ?? []).includes(id)) return g;
  const n = structuredClone(g);
  n.credits -= item.cost;
  n.equipment = [...(n.equipment ?? []), id];
  n.stats[item.stat] = clamp(n.stats[item.stat] + item.amount);
  n.history.unshift('장비 구매 · ' + item.name + ' · ' + item.stat + ' +' + item.amount);
  n.notices = [item.name + ' 장착 완료! 능력치가 올랐습니다.'];
  return n;
}
export function trainExperiment(g: Game, name: string): Game {
  if (!g.experimentPool.includes(name))
    return { ...g, notices: ['선수 실험체 풀에 포함된 실험체만 집중 훈련할 수 있습니다.'] };
  if (g.actionPoints < 1) return { ...g, notices: ['이번 주 행동력이 없습니다.'] };
  const n = structuredClone(g);
  n.actionPoints--;
  n.mastery[name] = clamp((n.mastery[name] ?? 0) + 7);
  n.fatigue = clamp(n.fatigue + 10);
  n.history.unshift(`S${n.season} ${n.week}주 · ${name} 집중 훈련 · 숙련도 ${n.mastery[name]}`);
  n.notices = [name + ' 숙련도가 ' + n.mastery[name] + '이 되었습니다.'];
  return n;
}
export function replacePoolExperiment(g: Game, index: number, name: string): Game {
  if (index < 1 || index > 2 || !characters.includes(name) || g.experimentPool.includes(name))
    return { ...g, notices: ['주력 실험체는 유지하고, 중복되지 않는 보조 실험체를 선택하세요.'] };
  if (g.credits < 250) return { ...g, notices: ['실험체 풀 변경에는 분석 크레딧 250이 필요합니다.'] };
  const n = structuredClone(g);
  const previous = n.experimentPool[index];
  n.experimentPool[index] = name;
  n.mastery[name] = n.mastery[name] ?? 8;
  n.credits -= 250;
  n.history.unshift('실험체 풀 변경 · ' + previous + ' → ' + name);
  n.notices = [name + '을 보조 실험체 풀에 등록했습니다.'];
  return n;
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
function ensureBench(n: Game, random: RandomSource) {
  if (n.teamMembers.some((member) => !member.starter)) return;
  const role: Role = ['탱커', '근거리 딜러', '원거리 딜러', '스킬 증폭 딜러', '서포터'][
    Math.floor(random() * 5)
  ] as Role;
  const options = roleExperiments[role].filter(
    (name) => name !== n.main && !n.teamMembers.some((member) => member.experiment === name),
  );
  const experiment = options[Math.floor(random() * options.length)];
  if (experiment)
    n.teamMembers.push({
      nickname: '제로',
      experiment,
      role,
      skill: 46,
      form: 52,
      fatigue: 8,
      starter: false,
    });
}
export function joinAmateurTeam(g: Game, random: RandomSource = Math.random): Game {
  if (g.rp < COMPETITION_RP.teamFormation || (g.fame ?? 0) < 5 || g.teamName)
    return { ...g, notices: ['미스릴 이상 · 인지도 5부터 아마추어 팀 제안이 옵니다.'] };
  const n = structuredClone(g);
  n.teamName = '루미아 웨이브';
  n.careerLeague = '아마추어';
  n.contract = { team: n.teamName, league: '아마추어', salary: 400, seasonsRemaining: 2 };
  n.teamHistory = [n.teamName, ...n.teamHistory];
  ensureBench(n, random);
  n.history.unshift('아마추어 팀 루미아 웨이브 합류 · 2시즌 계약');
  n.notices = ['루미아 웨이브에 합류했습니다.'];
  return n;
}
function completeKelRoster(n: Game, random: RandomSource) {
  while (n.teammateExperiments.length < 3) {
    const existingBench = n.teamMembers.find(
      (member) => !member.starter && !n.teammateExperiments.includes(member.experiment),
    );
    if (existingBench) {
      n.teammateExperiments.push(existingBench.experiment);
      n.teammateRoles.push(existingBench.role);
      continue;
    }
    const role: Role = ['탱커', '근거리 딜러', '원거리 딜러', '스킬 증폭 딜러', '서포터'][
      Math.floor(random() * 5)
    ] as Role;
    const options = roleExperiments[role].filter(
      (name) => name !== n.main && !n.teammateExperiments.includes(name),
    );
    const pick = options[Math.floor(random() * options.length)];
    if (pick) {
      n.teammateExperiments.push(pick);
      n.teammateRoles.push(role);
      n.teamMembers = [
        ...(n.teamMembers ?? []),
        { nickname: '루미아 후보', experiment: pick, role, skill: 48, form: 55, fatigue: 8, starter: false },
      ];
    }
  }
  n.kelRosterSize = 4;
}
export function joinKel(g: Game, random: RandomSource = Math.random): Game {
  if ((g.fame ?? 0) < 50 || (g.mastersPoints ?? 0) < 400)
    return { ...g, notices: ['KEL 스카우트 조건: 인지도 50 · 마스터즈 CP 400'] };
  const n = structuredClone(g);
  n.teamName = 'KEL 시티 유나이티드';
  n.careerLeague = 'KEL';
  n.contract = { team: n.teamName, league: 'KEL', salary: 950, seasonsRemaining: 3 };
  n.teamHistory = [n.teamName, ...n.teamHistory.filter((team) => team !== n.teamName)];
  completeKelRoster(n, random);
  n.history.unshift('KEL 시티 유나이티드 4인 로스터 등록 · 3시즌 계약');
  n.notices = ['KEL 4인 로스터에 등록되었습니다!'];
  return n;
}
export function promoteTeamToKel(g: Game, random: RandomSource = Math.random): Game {
  if (
    !['아마추어', '마스터즈'].includes(g.careerLeague) ||
    (g.fame ?? 0) < 60 ||
    (g.mastersPoints ?? 0) < 600
  )
    return { ...g, notices: ['팀 KEL 승격 조건: 아마추어 팀 · 인지도 60 · 마스터즈 CP 600'] };
  const n = structuredClone(g);
  n.careerLeague = 'KEL';
  n.teamName = '루미아 웨이브 KEL';
  n.contract = { team: n.teamName, league: 'KEL', salary: 900, seasonsRemaining: 3 };
  n.teamHistory = [n.teamName, ...n.teamHistory.filter((team) => team !== n.teamName)];
  completeKelRoster(n, random);
  n.history.unshift('루미아 웨이브 전원 KEL 신규 팀 승격 · 3시즌 계약');
  n.notices = ['팀 전체가 KEL 신규 팀으로 승격했습니다!'];
  return n;
}
export function acceptScoutOffer(g: Game, index: number, random: RandomSource = Math.random): Game {
  const offer = g.scoutOffers[index];
  if (!offer) return { ...g, notices: ['선택할 수 있는 스카우트 제안이 없습니다.'] };
  const n = structuredClone(g);
  n.teamName = offer.team;
  n.careerLeague = offer.league;
  n.contract = {
    team: offer.team,
    league: offer.league,
    salary: offer.salary,
    seasonsRemaining: offer.seasonsRemaining,
  };
  n.teamHistory = [offer.team, ...n.teamHistory.filter((team) => team !== offer.team)];
  n.credits += offer.signingBonus;
  n.scoutOffers = [];
  if (offer.league === 'KEL') completeKelRoster(n, random);
  n.history.unshift('이적 완료 · ' + offer.team + ' · ' + offer.seasonsRemaining + '시즌 계약');
  n.notices = [offer.team + ' 이적 완료 · 계약금 ' + offer.signingBonus + ' C'];
  return n;
}
export {
  canReceiveHallHonor,
  careerTotals,
  hallOfFameProgress,
  inductHallOfFame,
  majorTitleCount,
  mvpCount,
  receiveHallHonor,
  retireCareer,
} from './career';
export { playCommunityCup, recordKelStage } from './competitionProgress';
export { renewContract } from './contracts';
export { changeStarter } from './roster';
export { nextWeek } from './seasonProgress';
export { rankEntryFee, rankLabel, nextRankStep, rankScoreFor } from './rank';
