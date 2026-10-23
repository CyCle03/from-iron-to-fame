/* global console */
import { advanceCareerSeason } from '../src/application/advanceCareerSeason.ts';
import { createGame, joinAmateurTeam, joinKel, receiveHallHonor, retireCareer } from '../src/engine/game.ts';
import { canJoinAmateurTeam, canJoinKel } from '../src/engine/careerRules.ts';
import { createSeededRandom } from '../src/engine/random.ts';

const RUNS = 20;
const SEASONS = 30;
const summaries = [];

for (let seed = 1; seed <= RUNS; seed++) {
  const random = createSeededRandom(seed);
  let game = createGame(`시뮬레이션 ${seed}`, '아이언', '일반 유저', '유키', undefined, undefined, random);
  for (let season = 0; season < SEASONS; season++) {
    if (canJoinAmateurTeam(game)) game = joinAmateurTeam(game, random);
    if (canJoinKel(game)) game = joinKel(game, random);
    game = advanceCareerSeason(game, game.careerLeague === 'KEL' ? 'team' : 'rank', random).game;
    game = receiveHallHonor(game, '스타즈');
    game = receiveHallHonor(game, '히어로즈');
  }
  const activeHonors = [...game.hallOfFameHonors];
  game = receiveHallHonor(retireCareer(game), '아너스');
  summaries.push({
    rp: game.rp,
    fame: game.fame,
    community: game.competitionHistory.some((record) => record.kind === '지역 컵'),
    masters: game.competitionHistory.some((record) => record.kind === '마스터즈'),
    kel: game.competitionHistory.some((record) => record.kind === 'KEL'),
    stars: game.starsSelections > 0,
    heroes: activeHonors.includes('히어로즈'),
    honors: game.hallOfFameHonors.includes('아너스'),
  });
}

const rate = (key) => Math.round((summaries.filter((item) => item[key]).length / RUNS) * 100);
const average = (key) => Math.round(summaries.reduce((sum, item) => sum + item[key], 0) / RUNS);
const percentile = (key, fraction) => {
  const values = summaries.map((item) => item[key]).sort((a, b) => a - b);
  return values[Math.floor((values.length - 1) * fraction)];
};

console.log(`# ${RUNS}개 시드 · ${SEASONS}시즌 밸런스 분석`);
console.log('');
console.log(`- KeG 진출률: ${rate('community')}%`);
console.log(`- 마스터즈 진출률: ${rate('masters')}%`);
console.log(`- KEL 진출률: ${rate('kel')}%`);
console.log(`- 스타즈 선정률: ${rate('stars')}%`);
console.log(`- 히어로즈 선정률: ${rate('heroes')}%`);
console.log(`- 아너스 헌액률: ${rate('honors')}%`);
console.log(`- 최종 RP: 평균 ${average('rp')} · P10 ${percentile('rp', 0.1)} · P90 ${percentile('rp', 0.9)}`);
console.log(
  `- 최종 인지도: 평균 ${average('fame')} · P10 ${percentile('fame', 0.1)} · P90 ${percentile('fame', 0.9)}`,
);
