/* global console, process */
import { advanceCareerSeason } from '../src/application/advanceCareerSeason.ts';
import {
  CAREER_REQUIREMENTS,
  KEL_SELECTION_LEGACY,
  canJoinAmateurTeam,
  canJoinKel,
  type CareerRequirements,
} from '../src/engine/careerRules.ts';
import {
  careerTotals,
  createGame,
  joinAmateurTeam,
  joinKel,
  majorTitleCount,
  mvpCount,
  receiveHallHonor,
  retireCareer,
  type Action,
  type Game,
} from '../src/engine/game.ts';
import { createSeededRandom } from '../src/engine/random.ts';
import { TOURNAMENT_DIFFICULTY_BASELINE, TOURNAMENT_DIFFICULTY } from '../src/engine/tournament.ts';

const STRATEGIES = ['rank', 'team', 'balanced'] as const;
type Strategy = (typeof STRATEGIES)[number];

const STRATEGY_LABELS: Record<Strategy, string> = {
  rank: '랭크 집중',
  team: '팀 훈련 집중',
  balanced: '균형 운영',
};

type VariantName = 'legacy' | 'baseline' | 'candidate';
type Variant = { name: VariantName; requirements: CareerRequirements; difficulty: number };

const VARIANTS: Record<VariantName, Variant> = {
  legacy: {
    name: 'legacy',
    requirements: KEL_SELECTION_LEGACY,
    difficulty: TOURNAMENT_DIFFICULTY_BASELINE,
  },
  baseline: {
    name: 'baseline',
    requirements: CAREER_REQUIREMENTS,
    difficulty: TOURNAMENT_DIFFICULTY_BASELINE,
  },
  candidate: {
    name: 'candidate',
    requirements: CAREER_REQUIREMENTS,
    difficulty: TOURNAMENT_DIFFICULTY,
  },
};

type RateKey = 'community' | 'masters' | 'kel' | 'stars' | 'heroes' | 'honors';
type SeasonRateKey =
  'mastersSeasonCount' | 'kelSeasonCount' | 'finalAppearanceCount' | 'finalWinCount' | 'kelFinalWinCount';
type DistributionKey =
  | 'rp'
  | 'fame'
  | 'stats'
  | 'majorTitles'
  | 'wins'
  | 'podiums'
  | 'mvps'
  | 'kelSeason'
  | 'mastersSeasonCount'
  | 'kelSeasonCount'
  | 'finalAppearanceCount'
  | 'finalWinCount'
  | 'kelFinalWinCount';

type RunResult = {
  rp: number;
  fame: number;
  stats: number;
  community: boolean;
  masters: boolean;
  kel: boolean;
  stars: boolean;
  heroes: boolean;
  honors: boolean;
  majorTitles: number;
  wins: number;
  podiums: number;
  mvps: number;
  kelSeason: number | null;
  mastersSeasonCount: number;
  kelSeasonCount: number;
  finalAppearanceCount: number;
  finalWinCount: number;
  kelFinalWinCount: number;
};

type Report = { variant: VariantName; strategy: Strategy; runs: RunResult[]; seasons: number };

type CliOptions = {
  seeds: number;
  seedStart: number;
  seasons: number;
  strategies: Strategy[];
  variants: VariantName[];
  quiet: boolean;
};

const RATE_METRICS: { key: RateKey; label: string; target?: readonly [number, number] }[] = [
  { key: 'community', label: 'KeG 진출률' },
  { key: 'masters', label: '마스터즈 진출률', target: [30, 50] },
  { key: 'kel', label: 'KEL 진출률', target: [5, 20] },
  { key: 'stars', label: '스타즈 선정률' },
  { key: 'heroes', label: '히어로즈 선정률', target: [1, 10] },
  { key: 'honors', label: '아너스 헌액률', target: [0, 5] },
];

const SEASON_RATE_METRICS: { key: SeasonRateKey; label: string }[] = [
  { key: 'mastersSeasonCount', label: '마스터즈 참가 시즌' },
  { key: 'kelSeasonCount', label: 'KEL 참가 시즌' },
  { key: 'finalAppearanceCount', label: '상위 결승 진출 시즌' },
  { key: 'finalWinCount', label: '시즌 파이널 우승 시즌' },
  { key: 'kelFinalWinCount', label: 'KEL 결승 우승 시즌' },
];

const DISTRIBUTION_METRICS: { key: DistributionKey; label: string; digits: number }[] = [
  { key: 'rp', label: '최종 RP', digits: 0 },
  { key: 'fame', label: '최종 인지도', digits: 0 },
  { key: 'stats', label: '최종 능력치 평균', digits: 1 },
  { key: 'majorTitles', label: '메이저 우승', digits: 1 },
  { key: 'wins', label: '전체 우승', digits: 1 },
  { key: 'podiums', label: '포디움', digits: 1 },
  { key: 'mvps', label: 'MVP', digits: 1 },
  { key: 'kelSeason', label: 'KEL 첫 진출 시즌', digits: 1 },
  { key: 'mastersSeasonCount', label: '마스터즈 참가 시즌', digits: 1 },
  { key: 'kelSeasonCount', label: 'KEL 참가 시즌', digits: 1 },
  { key: 'finalAppearanceCount', label: '상위 결승 진출 시즌', digits: 1 },
  { key: 'finalWinCount', label: '시즌 파이널 우승', digits: 1 },
  { key: 'kelFinalWinCount', label: 'KEL 결승 우승', digits: 1 },
];

const DEFAULT_OPTIONS: CliOptions = {
  seeds: 100,
  seedStart: 1,
  seasons: 30,
  strategies: [...STRATEGIES],
  variants: ['candidate'],
  quiet: false,
};

const USAGE = `사용법: npm run balance:analyze -- [옵션]

옵션:
  --seeds <n>        고정 시드 개수 (기본 100)
  --seed-start <n>   시작 시드 (기본 1)
  --seasons <n>      시즌 수 (기본 30)
  --strategy <name>  rank, team, balanced, all (기본 all)
  --legacy           변경 전 CP-only KEL 기준선만 측정
  --baseline         조정 전 난도 +0 기준선만 측정
  --candidate        채택한 난도 규칙 측정 (기본값, 동일 KEL 정책)
  --compare          legacy·baseline·candidate를 같은 시드로 비교
  --quiet            시드 진행 로그를 끈다
  --help             이 도움말을 출력한다
`;

const printUsage = () => console.log(USAGE);

const fail = (message: string): never => {
  console.error(message);
  console.error(USAGE);
  process.exit(1);
};

const parsePositiveInteger = (flag: string, value: string | undefined) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) fail(`${flag} 값은 1 이상의 정수여야 합니다.`);
  return parsed;
};

const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    ...DEFAULT_OPTIONS,
    strategies: [...DEFAULT_OPTIONS.strategies],
    variants: [...DEFAULT_OPTIONS.variants],
  };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    if (arg === '--legacy') {
      options.variants = ['legacy'];
      continue;
    }
    if (arg === '--baseline') {
      options.variants = ['baseline'];
      continue;
    }
    if (arg === '--candidate') {
      options.variants = ['candidate'];
      continue;
    }
    if (arg === '--compare') {
      options.variants = ['legacy', 'baseline', 'candidate'];
      continue;
    }
    if (arg === '--quiet') {
      options.quiet = true;
      continue;
    }
    if (arg === '--seeds') {
      options.seeds = parsePositiveInteger(arg, args[++index]);
      continue;
    }
    if (arg === '--seed-start') {
      options.seedStart = parsePositiveInteger(arg, args[++index]);
      continue;
    }
    if (arg === '--seasons') {
      options.seasons = parsePositiveInteger(arg, args[++index]);
      continue;
    }
    if (arg === '--strategy') {
      const strategy = args[++index];
      if (strategy === 'all') options.strategies = [...STRATEGIES];
      else if (STRATEGIES.includes(strategy as Strategy)) options.strategies = [strategy as Strategy];
      else fail('--strategy 값은 rank, team, balanced, all 중 하나여야 합니다.');
      continue;
    }
    fail(`알 수 없는 옵션: ${arg}`);
  }
  return options;
};

const actionFor = (strategy: Strategy, game: Game): Action => {
  if (strategy === 'rank') return 'rank';
  if (strategy === 'team') return 'team';
  return game.careerLeague === 'KEL' ? 'team' : 'rank';
};

const runCareer = (seed: number, strategy: Strategy, variant: Variant, seasons: number): RunResult => {
  const random = createSeededRandom(seed);
  let game = createGame(`밸런스 ${seed}`, '아이언', '일반 유저', '유키', undefined, undefined, random);
  for (let season = 0; season < seasons; season++) {
    if (canJoinAmateurTeam(game)) game = joinAmateurTeam(game, random);
    if (canJoinKel(game, variant.requirements)) game = joinKel(game, random, variant.requirements);
    game = advanceCareerSeason(game, actionFor(strategy, game), random, variant.difficulty).game;
    game = receiveHallHonor(game, '스타즈');
    game = receiveHallHonor(game, '히어로즈');
  }

  const activeHonors = [...game.hallOfFameHonors];
  const retired = receiveHallHonor(retireCareer(game), '아너스');
  const records = retired.competitionHistory;
  const kelSeasons = records.filter((record) => record.kind === 'KEL').map((record) => record.season);
  const seasonCount = (predicate: (record: Game['competitionHistory'][number]) => boolean) =>
    new Set(records.filter(predicate).map((record) => record.season)).size;
  const totals = careerTotals(retired);
  const statValues = Object.values(retired.stats);

  return {
    rp: retired.rp,
    fame: retired.fame,
    stats: statValues.reduce((sum, value) => sum + value, 0) / statValues.length,
    community: records.some((record) => record.kind === '지역 컵'),
    masters: records.some((record) => record.kind === '마스터즈'),
    kel: kelSeasons.length > 0,
    stars: retired.starsSelections > 0,
    heroes: activeHonors.includes('히어로즈'),
    honors: retired.hallOfFameHonors.includes('아너스'),
    majorTitles: majorTitleCount(retired),
    wins: totals.wins,
    podiums: totals.podiums,
    mvps: mvpCount(retired),
    kelSeason: kelSeasons.length ? Math.min(...kelSeasons) : null,
    mastersSeasonCount: seasonCount((record) => ['마스터즈', 'LCQ', '시즌 파이널'].includes(record.kind)),
    kelSeasonCount: seasonCount((record) => record.kind === 'KEL'),
    finalAppearanceCount: seasonCount(
      (record) =>
        record.place > 0 && (record.kind === '시즌 파이널' || (record.kind === 'KEL' && record.stage === 7)),
    ),
    finalWinCount: seasonCount((record) => record.kind === '시즌 파이널' && record.place === 1),
    kelFinalWinCount: seasonCount(
      (record) => record.kind === 'KEL' && record.stage === 7 && record.place === 1,
    ),
  };
};

const rate = (runs: RunResult[], key: RateKey) =>
  Math.round((runs.filter((run) => run[key]).length / runs.length) * 1000) / 10;

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const percentile = (values: number[], fraction: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
};

const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const formatRateCell = (value: number, target?: readonly [number, number]) => {
  const label = `${formatNumber(value, Number.isInteger(value) ? 0 : 1)}%`;
  if (!target) return label;
  const verdict = value >= target[0] && value <= target[1] ? '목표 내' : '목표 밖';
  return `${label} (${verdict})`;
};

const renderTable = (headers: string[], rows: string[][]) => {
  console.log(`| ${headers.join(' | ')} |`);
  console.log(`| ${headers.map(() => '---').join(' | ')} |`);
  for (const row of rows) console.log(`| ${row.join(' | ')} |`);
};

const printRateTable = (reports: Report[]) => {
  const headers = ['지표', ...reports.map((report) => report.variant), '목표'];
  const rows = RATE_METRICS.map((metric) => [
    metric.label,
    ...reports.map((report) => formatRateCell(rate(report.runs, metric.key), metric.target)),
    metric.target ? `${metric.target[0]}~${metric.target[1]}%` : '—',
  ]);
  renderTable(headers, rows);
};

const seasonRate = (report: Report, key: SeasonRateKey) => {
  const totalSeasons = report.runs.length * report.seasons;
  const count = report.runs.reduce((sum, run) => sum + run[key], 0);
  return Math.round((count / totalSeasons) * 1000) / 10;
};

const printSeasonRateTable = (reports: Report[]) => {
  const headers = ['시즌별 지표', ...reports.map((report) => report.variant)];
  const rows = SEASON_RATE_METRICS.map((metric) => [
    metric.label,
    ...reports.map((report) => formatRateCell(seasonRate(report, metric.key))),
  ]);
  renderTable(headers, rows);
};

const printDistributionTable = (report: Report) => {
  console.log(`**분포 · ${report.variant}**`);
  console.log('');
  const headers = ['지표', '평균', 'P10', 'P50', 'P90'];
  const rows = DISTRIBUTION_METRICS.map((metric) => {
    const values = report.runs
      .map((run) => run[metric.key])
      .filter((value): value is number => typeof value === 'number');
    if (!values.length) return [metric.label, '진출 없음', '—', '—', '—'];
    const cells = [
      mean(values),
      percentile(values, 0.1),
      percentile(values, 0.5),
      percentile(values, 0.9),
    ].map((value) => formatNumber(value, metric.digits));
    return [metric.label, ...cells];
  });
  renderTable(headers, rows);
  console.log('');
};

const describeVariant = (variantName: VariantName) => {
  const variant = VARIANTS[variantName];
  const recent =
    variant.requirements.kelRecentFinalPlace === null
      ? '성적 조건 없음'
      : `최근 파이널 TOP${variant.requirements.kelRecentFinalPlace}`;
  const cp = variant.requirements.kelMastersPoints;
  return `${variantName} (${recent} · CP ${cp} · 난도 +${variant.difficulty})`;
};

const printHeader = (options: CliOptions) => {
  const seedRange = `${options.seedStart}..${options.seedStart + options.seeds - 1} (${options.seeds}개)`;
  const strategyLabels = options.strategies.map((strategy) => STRATEGY_LABELS[strategy]).join(', ');
  console.log('# 장기 커리어 밸런스 분석');
  console.log('');
  console.log(`- 고정 시드: ${seedRange}`);
  console.log(`- 시즌: ${options.seasons}`);
  console.log(`- 전략: ${strategyLabels}`);
  console.log(`- 규칙: ${options.variants.map(describeVariant).join(' / ')}`);
  console.log('');
};

const printCheckpoint = (report: Report) => {
  const kelRate = formatRateCell(rate(report.runs, 'kel'));
  const mastersRate = formatRateCell(rate(report.runs, 'masters'));
  const kelSeasonRate = formatRateCell(seasonRate(report, 'kelSeasonCount'));
  const finalWinRate = formatRateCell(seasonRate(report, 'finalWinCount'));
  console.log(`[${report.strategy}/${report.variant}] ${report.runs.length}시드 완료`);
  console.log(`  평생 KEL ${kelRate} · 마스터즈 ${mastersRate}`);
  console.log(`  시즌 KEL 참가 ${kelSeasonRate} · 시즌 파이널 우승 ${finalWinRate}`);
  console.log('');
};

const printStrategy = (strategy: Strategy, reports: Report[]) => {
  console.log(`## ${STRATEGY_LABELS[strategy]} (${strategy})`);
  console.log('');
  console.log('### 평생 진출·선정률 (목표 표시는 과거 희소성 기준과의 비교)');
  console.log('');
  printRateTable(reports);
  console.log('');
  console.log('### 시즌별 참가·우승률');
  console.log('');
  printSeasonRateTable(reports);
  console.log('');
  console.log('※ 성장·재도전을 유지하며 시즌별 경쟁 결과와 평생 달성률을 분리해 평가합니다.');
  console.log('');
  for (const report of reports) printDistributionTable(report);
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.seeds < 100)
    console.error('주의: 시드가 100개 미만입니다. 이 결과를 밸런스 기준선으로 사용하지 마세요.');

  printHeader(options);
  const endSeed = options.seedStart + options.seeds - 1;
  for (const strategy of options.strategies) {
    const reports: Report[] = [];
    for (const variantName of options.variants) {
      const variant = VARIANTS[variantName];
      const runs: RunResult[] = [];
      for (let seed = options.seedStart; seed <= endSeed; seed++) {
        runs.push(runCareer(seed, strategy, variant, options.seasons));
        const completed = seed - options.seedStart + 1;
        if (!options.quiet && completed % 10 === 0)
          console.error(`${variantName}/${strategy} · ${completed}/${options.seeds} 시드`);
      }
      const report = { variant: variantName, strategy, runs, seasons: options.seasons };
      reports.push(report);
      if (options.variants.length > 1) printCheckpoint(report);
    }
    printStrategy(strategy, reports);
  }
};

main();
