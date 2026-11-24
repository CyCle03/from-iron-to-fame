import { describe, expect, it } from 'vitest';
import { createGame } from '../engine/game';
import { careerAchievements } from './careerAchievements';

describe('careerAchievements', () => {
  it('orders competition, awards and honors without replaying existing records', () => {
    const before = createGame('검증 선수', '아이언', '일반 유저', '유키');
    const after = structuredClone(before);
    after.competitionHistory = [
      { season: 1, kind: 'KEL', stage: 7, place: 1, points: 100 },
      { season: 1, kind: '지역 컵', stage: 1, place: 4, points: 0 },
    ];
    after.awards = ['e스포츠 명예의 전당 히어로즈', 'S1 KEL MVP'];
    const events = careerAchievements(before, after);
    expect(events.map((event) => event.category)).toEqual([
      '대회 결과',
      '대회 결과',
      '개인 수상',
      '커리어 이정표',
    ]);
    expect(events[1].title).toContain('KEL 7단계 우승');
    expect(careerAchievements(after, structuredClone(after))).toEqual([]);
  });
  it('recognizes repeat Stars but retains first award detail', () => {
    const before = createGame('검증 선수', '아이언', '일반 유저', '유키');
    before.starsSelections = 1;
    before.awards = ['S1 e스포츠 명예의 전당 스타즈'];
    const after = structuredClone(before);
    after.awards.unshift('S2 e스포츠 명예의 전당 스타즈');
    expect(careerAchievements(before, after)[0]).toMatchObject({ repeat: true, category: '커리어 이정표' });
  });
});
