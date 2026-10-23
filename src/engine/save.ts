import {
  CURRENT_SAVE_VERSION,
  backgrounds,
  characterSet,
  createGame,
  createMastersSeason,
  createSeasonMeta,
  ranks,
  roleExperiments,
  roleForExperiment,
  type Background,
  type Game,
  type Rank,
  type Role,
  type StatKey,
  type TeamMember,
} from './game';

const DEFAULT_FOCUS: StatKey[] = ['physical', 'macro'];
const ACTIONS = new Set(['rank', 'physical', 'macro', 'specialist', 'review', 'team', 'rest']);
const STAT_KEYS = new Set<StatKey>([
  'physical',
  'combat',
  'macro',
  'judgement',
  'teamwork',
  'mental',
  'focus',
  'adaptability',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function migrateGameSave(raw: unknown): Game | null {
  if (!isRecord(raw)) return null;

  const rank = ranks.includes(raw.rank as Rank) ? (raw.rank as Rank) : '아이언';
  const background = Object.hasOwn(backgrounds, raw.background as string)
    ? (raw.background as Background)
    : '일반 유저';
  const requestedRole = Object.hasOwn(roleExperiments, raw.role as string)
    ? (raw.role as Role)
    : '근거리 딜러';
  const savedMain = typeof raw.main === 'string' && characterSet.has(raw.main) ? raw.main : null;
  const main = savedMain ?? roleExperiments[requestedRole][0];
  const role = roleForExperiment(main) ?? requestedRole;
  const trainingFocus = Array.isArray(raw.trainingFocus)
    ? raw.trainingFocus
        .filter((key): key is StatKey => typeof key === 'string' && STAT_KEYS.has(key as StatKey))
        .slice(0, 2)
    : DEFAULT_FOCUS;
  const baseline = createGame(
    typeof raw.name === 'string' ? raw.name : '루미아 신인',
    rank,
    background,
    role,
    main,
    trainingFocus.length === 2 ? trainingFocus : DEFAULT_FOCUS,
  );

  const savedPool = stringArray(raw.experimentPool).filter((name) => characterSet.has(name));
  const experimentPool = [main, ...savedPool.filter((name) => name !== main)];
  for (const candidate of roleExperiments[role]) {
    if (experimentPool.length >= 3) break;
    if (!experimentPool.includes(candidate)) experimentPool.push(candidate);
  }

  const savedMastery = isRecord(raw.mastery) ? raw.mastery : {};
  const mastery = {
    ...baseline.mastery,
    ...Object.fromEntries(
      Object.entries(savedMastery).filter(
        (entry): entry is [string, number] => characterSet.has(entry[0]) && typeof entry[1] === 'number',
      ),
    ),
  };
  for (const [index, name] of experimentPool.entries()) {
    mastery[name] ??= index === 0 ? 28 : 12;
  }

  const teammateExperiments = stringArray(raw.teammateExperiments).filter((name) => characterSet.has(name));
  const savedMembers = Array.isArray(raw.teamMembers) ? raw.teamMembers : [];
  const teamMembers = savedMembers.filter(
    (member): member is TeamMember =>
      isRecord(member) && typeof member.experiment === 'string' && characterSet.has(member.experiment),
  );
  const season =
    typeof raw.season === 'number' && Number.isFinite(raw.season) ? Math.max(11, Math.floor(raw.season)) : 11;
  const teamName = typeof raw.teamName === 'string' ? raw.teamName : null;
  const savedSummary = isRecord(raw.lastSeasonSummary) ? raw.lastSeasonSummary : null;
  const lastSeasonSummary = savedSummary
    ? ({
        ...savedSummary,
        seasonCondition:
          savedSummary.seasonCondition === '집중 운영' || savedSummary.seasonCondition === '회복 운영'
            ? savedSummary.seasonCondition
            : '균형 운영',
        conditionNote:
          typeof savedSummary.conditionNote === 'string'
            ? savedSummary.conditionNote
            : '시즌 종료 후 다음 시즌을 위한 자동 정비가 완료되었습니다.',
        autoRecoveryWeeks:
          typeof savedSummary.autoRecoveryWeeks === 'number' ? Math.max(0, Math.floor(savedSummary.autoRecoveryWeeks)) : 0,
      } as Game['lastSeasonSummary'])
    : null;

  return {
    ...baseline,
    ...(raw as Partial<Game>),
    version: CURRENT_SAVE_VERSION,
    rank,
    background,
    role,
    main,
    season,
    trainingFocus: trainingFocus.length === 2 ? trainingFocus : DEFAULT_FOCUS,
    lastSeasonPlan: typeof raw.lastSeasonPlan === 'string' && ACTIONS.has(raw.lastSeasonPlan) ? raw.lastSeasonPlan as Game['lastSeasonPlan'] : baseline.lastSeasonPlan,
    turningPointAvailable: raw.turningPointAvailable === true,
    lastSeasonSummary,
    experimentPool: experimentPool.slice(0, 3),
    mastery,
    teammateExperiments,
    teammateRoles: teammateExperiments.map((name) => roleForExperiment(name) ?? '근거리 딜러'),
    teamMembers: teamMembers.length ? teamMembers : baseline.teamMembers,
    teamName,
    teamHistory: stringArray(raw.teamHistory).length
      ? stringArray(raw.teamHistory)
      : teamName
        ? [teamName]
        : [],
    awards: stringArray(raw.awards),
    equipment: stringArray(raw.equipment),
    history: stringArray(raw.history).length ? stringArray(raw.history) : baseline.history,
    notices: stringArray(raw.notices).length ? stringArray(raw.notices) : baseline.notices,
    competitionHistory: Array.isArray(raw.competitionHistory)
      ? (raw.competitionHistory as Game['competitionHistory'])
      : [],
    matches: Array.isArray(raw.matches) ? (raw.matches as Game['matches']) : [],
    contract: isRecord(raw.contract) ? (raw.contract as Game['contract']) : null,
    scoutOffers: Array.isArray(raw.scoutOffers) ? (raw.scoutOffers as Game['scoutOffers']) : [],
    mastersSeason: isRecord(raw.mastersSeason)
      ? (raw.mastersSeason as Game['mastersSeason'])
      : createMastersSeason(season, teamName),
    seasonMeta: isRecord(raw.seasonMeta) ? (raw.seasonMeta as Game['seasonMeta']) : createSeasonMeta(season),
  };
}

export const serializeGameSave = (game: Game) => JSON.stringify(game, null, 2);

export const getSavePreview = (game: Game) => ({
  name: game.name,
  season: game.season,
  rank: game.rank,
  main: game.main,
  teamName: game.teamName,
  version: game.version,
});

export function parseGameSave(contents: string): Game | null {
  try {
    return migrateGameSave(JSON.parse(contents));
  } catch {
    return null;
  }
}
