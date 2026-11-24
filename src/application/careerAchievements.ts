import type { Game } from '../engine/game';
import { nextCareerGoal } from '../engine/careerRules';

export type CareerAchievement = {
  title: string;
  detail: string;
  category: '대회 결과' | '개인 수상' | '커리어 이정표';
  repeat: boolean;
};

// Compare committed records, not toast text. Loading a save never creates a new event.
export function careerAchievements(before: Game, after: Game): CareerAchievement[] {
  const events: CareerAchievement[] = [];
  const recordKey = (record: Game['competitionHistory'][number]) =>
    `${record.season}:${record.kind}:${record.stage}`;
  const previous = new Set(before.competitionHistory.map(recordKey));
  for (const record of after.competitionHistory.filter((item) => !previous.has(recordKey(item))).reverse()) {
    const name =
      record.kind === '지역 컵'
        ? record.stage === 1
          ? 'KeG 지역대표선발전'
          : 'KeG 전국결선'
        : `${record.kind} ${record.stage}단계`;
    events.push({
      category: '대회 결과',
      title: record.place === 1 ? `${name} 우승` : `${name} 결과`,
      detail: `S${record.season} · ${record.place > 0 ? `${record.place}위` : '진출 실패'} · ${record.points} CP`,
      repeat:
        record.place === 1 &&
        before.competitionHistory.some((item) => item.kind === record.kind && item.place === 1),
    });
  }
  const lastCompetition = events.at(-1);
  if (lastCompetition) {
    const goal = nextCareerGoal(after);
    lastCompetition.detail += ` · 다음 목표: ${goal.title} (${goal.detail})`;
  }
  const awards = new Set(before.awards);
  for (const award of after.awards.filter((item) => !awards.has(item)).reverse()) {
    const milestone = award.includes('명예의 전당');
    events.push({
      category: milestone ? '커리어 이정표' : '개인 수상',
      title: award,
      detail: milestone
        ? '선정 조건을 충족하여 커리어 기록에 반영되었습니다.'
        : '공식 대회 성적에 따른 수상 기록입니다.',
      repeat: milestone && award.includes('스타즈') && before.starsSelections > 0,
    });
  }
  if (after.fame > before.fame && events.length) {
    events[0].detail += ` · 인지도 +${after.fame - before.fame} (전체 일정 합계)`;
  }
  return events.sort(
    (a, b) =>
      ['대회 결과', '개인 수상', '커리어 이정표'].indexOf(a.category) -
      ['대회 결과', '개인 수상', '커리어 이정표'].indexOf(b.category),
  );
}
