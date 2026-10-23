import { describe, it, expect } from 'vitest';
import {
  act,
  createGame,
  createMastersSeason,
  nextWeek,
  runSeason,
  rankEntryFee,
  playCommunityCup,
  joinAmateurTeam,
  joinKel,
  recordMastersPhase,
  recordKelStage,
  finishMastersSeason,
  trainExperiment,
  replacePoolExperiment,
  changeStarter,
  acceptScoutOffer,
  renewContract,
  careerTotals,
  retireCareer,
  validateGameState,
  CURRENT_SAVE_VERSION,
  roleExperiments,
  characters,
  roleForExperiment,
  hyperCarryTankers,
  experimentTags,
  hasExperimentTag,
  hallOfFameProgress,
  inductHallOfFame,
  resolveSeasonTurningPoint,
  type Game,
} from './game';
import { createSeededRandom } from './random';
describe('career engine', () => {
  it('keeps one primary role per selectable experiment', () => {
    const assigned = Object.values(roleExperiments).flat();
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(characters).toEqual(assigned);
    expect(characters).toHaveLength(91);
    expect(roleForExperiment('테오도르')).toBe('원거리 딜러');
    expect(hyperCarryTankers.every((name) => roleForExperiment(name) === '탱커')).toBe(true);
    expect(experimentTags['하이퍼캐리'].every((name) => characters.includes(name))).toBe(true);
    expect(hasExperimentTag('아델라', '하이퍼캐리')).toBe(true);
    expect(hasExperimentTag('슈린', '하이퍼캐리')).toBe(true);
    expect(roleExperiments['원거리 딜러']).toContain('테오도르');
    expect(roleExperiments['탱커']).toEqual(expect.arrayContaining(['쇼우', '케네스', '세레스']));
    expect(roleExperiments['스킬 증폭 딜러']).toEqual(
      expect.arrayContaining(['아이솔', '헤이즈', '크레이버', '루치아', '유스티나', '헨리']),
    );
    expect(assigned).not.toContain('니콜라스');
  });
  it('uses the official 1/3-premade entry-fee bands', () => {
    expect(rankEntryFee(0)).toBe(0);
    expect(rankEntryFee(600)).toBe(10);
    expect(rankEntryFee(1400)).toBe(18);
    expect(rankEntryFee(2400)).toBe(28);
    expect(rankEntryFee(3600)).toBe(36);
    expect(rankEntryFee(5000)).toBe(45);
    expect(rankEntryFee(6400)).toBe(53);
    expect(rankEntryFee(7600)).toBe(58);
  });
  it('creates an independent player profile', () => {
    const g = createGame('테스트', '아이언', '피지컬 괴물', '아야');
    expect(g.stats.physical).toBeGreaterThan(g.stats.macro);
    expect(g.actionPoints).toBe(3);
  });
  it('runs a full season and triggers a focus event', () => {
    const before = createGame('테스트', '골드', '일반 유저', '유키');
    const after = runSeason(before, 'rank');
    expect(after.season).toBe(before.season + 1);
    expect(after.trainingFocus).toHaveLength(2);
    expect(after.matches).toHaveLength(56);
    expect(after.lastSeasonSummary?.matches).toBe(56);
    expect(after.lastSeasonPlan).toBe('rank');
    expect(after.fatigue).toBe(12);
    expect(after.lastSeasonSummary?.seasonCondition).toBe('집중 운영');
    expect(after.lastSeasonSummary?.autoRecoveryWeeks).toBeGreaterThan(0);
    expect(after.mastersPhase).toBe(0);
    expect(after.kelStage).toBe(0);
  });
  it('lets a low-tier rank-focused career make visible progress in one season', () => {
    const before = createGame('등반', '아이언', '일반 유저', '유키');
    const after = runSeason(before, 'rank', createSeededRandom(20261023));
    expect(after.rp).toBeGreaterThanOrEqual(600);
    expect(after.lastSeasonSummary?.matches).toBe(56);
  });
  it('applies one turning-point choice after a season', () => {
    const completed = runSeason(createGame('테스트', '골드', '일반 유저', '유키'), 'rank');
    const before = completed.stats.macro;
    const resolved = resolveSeasonTurningPoint(completed, 'analysis');
    expect(resolved.turningPointAvailable).toBe(false);
    expect(resolved.stats.macro).toBe(before + 3);
    expect(resolveSeasonTurningPoint(resolved, 'team')).toEqual(resolved);
  });
  it('soft-resets RP and unlocks career progression', () => {
    const base = { ...createGame('테스트', '골드', '일반 유저', '유키'), week: 12, rp: 3000 };
    const reset = nextWeek(base);
    expect(reset.rp).toBe(2790);
    const cup = playCommunityCup({ ...reset, rp: 7600 });
    expect(cup.fame).toBeGreaterThan(0);
    expect(cup.competitionHistory[0].place).toBeGreaterThanOrEqual(1);
    expect(cup.competitionHistory[0].place).toBeLessThanOrEqual(8);
    const team = joinAmateurTeam({ ...cup, fame: 50 });
    expect(team.careerLeague).toBe('아마추어');
    const kel = joinKel({ ...team, fame: 180, mastersPoints: 400 });
    expect(kel.careerLeague).toBe('KEL');
    expect(kel.kelRosterSize).toBe(4);
    expect(kel.teammateExperiments).toHaveLength(3);
  });
  it('enforces esports eligibility in the engine', () => {
    const solo = createGame('테스트', '골드', '일반 유저', '유키');
    expect(recordMastersPhase({ ...solo, fame: 100 }, 100).mastersPhase).toBe(0);
    const amateur = {
      ...solo,
      rp: 8400,
      fame: 100,
      teamName: '테스트 팀',
      careerLeague: '아마추어' as const,
    };
    const masters = recordMastersPhase(amateur, 120);
    expect(masters.mastersPhase).toBe(1);
    expect(masters.careerLeague).toBe('마스터즈');
    expect(recordKelStage(masters, 1).kelStage).toBe(0);
    const kel = { ...masters, careerLeague: 'KEL' as const, kelRosterSize: 4 };
    expect(recordKelStage(kel, 1).kelStage).toBe(1);
  });
  it('limits cups and supports hall of fame induction', () => {
    let g: Game = {
      ...createGame('전설', '메테오라이트', '일반 유저', '유키'),
      rp: 7000,
      trophies: 3,
      careerLeague: 'KEL' as const,
      retired: true,
      retirementSeason: 11,
      teamHistory: ['KEL 시티 유나이티드'],
      hallOfFameHonors: ['히어로즈'],
      awards: ['MVP 1', 'MVP 2'],
      competitionHistory: Array.from({ length: 5 }, (_, season) => ({
        season,
        kind: '시즌 파이널' as const,
        stage: 1,
        place: 1,
        points: 0,
      })),
      fame: 2500,
    };
    expect(Object.values(hallOfFameProgress(g).honors).every(Boolean)).toBe(true);
    g = inductHallOfFame(g);
    expect(g.hallOfFame).toBe(true);
    const cupBase = { ...g, seasonCupEntries: 2 };
    expect(playCommunityCup(cupBase).communityCups).toBe(cupBase.communityCups);
    expect(recordKelStage({ ...g, kelStage: 0 }, 1).trophies).toBe(4);
  });
  it('uses an action and advances the week', () => {
    const g = act(createGame('테스트', '골드', '일반 유저', '유키'), 'physical');
    expect(g.actionPoints).toBe(2);
    expect(g.fatigue).toBeGreaterThan(12);
    expect(nextWeek(g).actionPoints).toBe(3);
  });
  it('records rank games and grows practical skills', () => {
    const before = createGame('테스트', '골드', '일반 유저', '유키');
    const g = act(before, 'rank');
    expect(g.matches).toHaveLength(8);
    expect(g.matches.every((m) => typeof m.fee === 'number' && typeof m.gross === 'number')).toBe(true);
    expect(g.matches.every((m) => m.place >= 1 && m.place <= 8)).toBe(true);
    expect(g.rank).toBeTruthy();
    expect(g.stats.combat).toBeGreaterThan(before.stats.combat);
    expect(g.mastery.유키).toBeGreaterThan(before.mastery.유키);
  });
});

describe('masters season', () => {
  it('creates a reproducible 48-team field', () => {
    expect(createMastersSeason(11, '테스트 팀')).toEqual(createMastersSeason(11, '테스트 팀'));
    expect(createMastersSeason(11, '테스트 팀').standings).toHaveLength(48);
  });
  it('runs phases, LCQ, and an eight-team final', () => {
    let game: Game = {
      ...createGame('테스트', '골드', '일반 유저', '유키'),
      rp: 8400,
      fame: 100,
      teamName: '테스트 팀',
      careerLeague: '아마추어',
    };
    game = recordMastersPhase(game, 400, 1);
    game = recordMastersPhase(game, 345, 2);
    game = recordMastersPhase(game, 290, 3);
    expect(game.mastersSeason.standings.every((team) => team.phasePlaces.length === 3)).toBe(true);
    expect(game.mastersSeason.standings.filter((team) => team.qualification === '직행')).toHaveLength(7);
    game = finishMastersSeason(game);
    expect(game.mastersSeason.finalists).toHaveLength(8);
    expect(game.mastersSeason.lcqWinner).toBeTruthy();
    expect(game.mastersSeason.champion).toBeTruthy();
    expect(game.competitionHistory[0].kind).toBe('시즌 파이널');
  });
});

describe('experiment pool management', () => {
  it('trains a selected pool experiment', () => {
    const game = createGame('테스트', '골드', '일반 유저', '유키');
    const target = game.experimentPool[1];
    const trained = trainExperiment(game, target);
    expect(trained.mastery[target]).toBeGreaterThan(game.mastery[target]);
    expect(trained.actionPoints).toBe(game.actionPoints - 1);
    expect(trained.fatigue).toBeGreaterThan(game.fatigue);
  });
  it('replaces only a support slot and charges credits', () => {
    const game = createGame('테스트', '골드', '일반 유저', '유키');
    const changed = replacePoolExperiment(game, 1, '아야');
    expect(changed.experimentPool[0]).toBe(game.main);
    expect(changed.experimentPool[1]).toBe('아야');
    expect(changed.mastery.아야).toBe(8);
    expect(changed.credits).toBe(game.credits - 250);
    expect(replacePoolExperiment(changed, 0, '현우').experimentPool).toEqual(changed.experimentPool);
  });
});

describe('contracts and transfers', () => {
  it('pays salary and expires a contract into free agency', () => {
    let game = joinAmateurTeam({ ...createGame('테스트', '골드', '일반 유저', '유키'), rp: 7600, fame: 50 });
    expect(game.contract?.seasonsRemaining).toBe(2);
    const credits = game.credits;
    game = runSeason(game, 'rest');
    expect(game.credits).toBeGreaterThan(credits);
    expect(game.contract?.seasonsRemaining).toBe(1);
    game = runSeason(game, 'rest');
    expect(game.contract).toBeNull();
    expect(game.teamName).toBeNull();
    expect(game.careerLeague).toBe('솔로');
    expect(game.scoutOffers.length).toBe(0);
  });
  it('renews and accepts a transfer offer', () => {
    let game = joinAmateurTeam({ ...createGame('테스트', '골드', '일반 유저', '유키'), rp: 7600, fame: 130 });
    game = { ...game, contract: { ...game.contract!, seasonsRemaining: 1 } };
    game = renewContract(game);
    expect(game.contract?.seasonsRemaining).toBe(2);
    game = runSeason(game, 'rest');
    game.scoutOffers = [
      { team: '아스트라 나이츠', league: '마스터즈', salary: 800, seasonsRemaining: 2, signingBonus: 400 },
    ];
    expect(game.scoutOffers.some((offer) => offer.league === '마스터즈')).toBe(true);
    const index = game.scoutOffers.findIndex((offer) => offer.league === '마스터즈');
    const moved = acceptScoutOffer(game, index);
    expect(moved.teamName).toBe('아스트라 나이츠');
    expect(moved.careerLeague).toBe('마스터즈');
    expect(moved.scoutOffers).toHaveLength(0);
  });
});

describe('roster management', () => {
  it('swaps a bench player into the active squad with a teamwork cost', () => {
    const game = joinAmateurTeam({
      ...createGame('테스트', '골드', '일반 유저', '유키'),
      rp: 7600,
      fame: 50,
    });
    const benchIndex = game.teamMembers.findIndex((member) => !member.starter);
    expect(benchIndex).toBeGreaterThanOrEqual(0);
    const teamwork = game.stats.teamwork;
    const changed = changeStarter(game, benchIndex);
    expect(changed.teamMembers[benchIndex].starter).toBe(true);
    expect(changed.teamMembers.filter((member) => member.starter)).toHaveLength(2);
    expect(changed.stats.teamwork).toBe(teamwork - 3);
  });
  it('improves active roster form more during team practice', () => {
    const game = joinAmateurTeam({
      ...createGame('테스트', '골드', '일반 유저', '유키'),
      rp: 7600,
      fame: 50,
    });
    const starter = game.teamMembers.findIndex((member) => member.starter);
    const bench = game.teamMembers.findIndex((member) => !member.starter);
    const trained = act(game, 'team');
    expect(trained.teamMembers[starter].form - game.teamMembers[starter].form).toBeGreaterThan(
      trained.teamMembers[bench].form - game.teamMembers[bench].form,
    );
  });
});

describe('career archive', () => {
  it('derives totals from competition history', () => {
    const game: Game = {
      ...createGame('테스트', '골드', '일반 유저', '유키'),
      competitionHistory: [
        { season: 11, kind: '지역 컵', stage: 1, place: 1, points: 0 },
        { season: 11, kind: '마스터즈', stage: 1, place: 3, points: 290 },
        { season: 11, kind: 'KEL', stage: 1, place: 5, points: 0 },
      ],
      mastery: { 유키: 40, 아야: 55 },
    };
    expect(careerTotals(game)).toEqual({
      events: 3,
      wins: 1,
      podiums: 2,
      bestPlace: 1,
      representative: '아야',
    });
  });
  it('retires into a read-only archive before hall of fame review', () => {
    const active: Game = {
      ...createGame('전설', '메테오라이트', '일반 유저', '유키'),
      rp: 7000,
      trophies: 3,
      careerLeague: 'KEL',
      teamName: 'KEL 시티 유나이티드',
      teamHistory: ['KEL 시티 유나이티드'],
      contract: { team: 'KEL 시티 유나이티드', league: 'KEL', salary: 900, seasonsRemaining: 2 },
      fame: 2500,
      hallOfFameHonors: ['히어로즈'],
      awards: ['MVP 1', 'MVP 2'],
      competitionHistory: Array.from({ length: 5 }, (_, season) => ({
        season,
        kind: '시즌 파이널' as const,
        stage: 1,
        place: 1,
        points: 0,
      })),
    };
    expect(hallOfFameProgress(active).honors.retired).toBe(false);
    const retired = retireCareer(active);
    expect(retired.retired).toBe(true);
    expect(retired.contract).toBeNull();
    expect(retired.retirementSeason).toBe(active.season);
    expect(inductHallOfFame(retired).hallOfFame).toBe(true);
  });
  it('records a KEL MVP award for a win', () => {
    const game: Game = { ...createGame('테스트', '메테오라이트', '일반 유저', '유키'), careerLeague: 'KEL' };
    const winner = recordKelStage(game, 1);
    expect(winner.awards[0]).toContain('MVP');
    expect(careerTotals(winner).wins).toBe(1);
  });
});

describe('long-run stability', () => {
  it('keeps state valid through 30 deterministic seasons', () => {
    const random = createSeededRandom(20261022);
    let game = createGame('장기 테스트', '아이언', '일반 유저', '유키', undefined, undefined, random);
    for (let season = 0; season < 30; season++) {
      game = runSeason(game, (['rank', 'physical', 'macro', 'team', 'rest'] as const)[season % 5], random);
      expect(validateGameState(game)).toEqual([]);
    }
    expect(game.season).toBe(41);
    expect(game.version).toBe(CURRENT_SAVE_VERSION);
  });
});
