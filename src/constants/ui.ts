import type {Action, StatKey} from '../engine/game';

export const SAVE_KEY = 'iron-to-fame-save-v1';

export const NAVIGATION_TABS = [
  '대시보드', '시즌 센터', '주간 행동', '장비 상점', '대회', '선수 기록', '게임 안내',
] as const;

export type NavigationTab = (typeof NAVIGATION_TABS)[number];

export const STAT_LABELS: Record<StatKey, string> = {
  physical: '피지컬',
  combat: '교전',
  macro: '운영',
  judgement: '판단',
  teamwork: '팀워크',
  mental: '멘탈',
  focus: '집중력',
  adaptability: '적응력',
};

export const SEASON_ACTIONS: {id: Action; title: string; desc: string}[] = [
  {id: 'rank', title: '랭크 게임', desc: '랭크 7주 + 회복·분석 자동 배분'},
  {id: 'physical', title: '피지컬 훈련', desc: '훈련·실전·회복 균형 플랜'},
  {id: 'macro', title: '운영 훈련', desc: '분석·랭크·회복 균형 플랜'},
  {id: 'specialist', title: '실험체 집중 연습', desc: '숙련도 중심 시즌 운영'},
  {id: 'review', title: '리플레이 분석', desc: '리뷰·운영 중심 시즌 운영'},
  {id: 'team', title: '팀 합동 연습', desc: '합동 연습·실전 시즌 운영'},
  {id: 'rest', title: '휴식', desc: '회복·재정비 시즌 운영'},
];
