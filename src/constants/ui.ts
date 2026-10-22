import type { Action, StatKey } from '../engine/game';

export const SAVE_KEY = 'iron-to-fame-save-v1';

export const NAVIGATION_TABS = [
  '대시보드',
  '시즌 센터',
  '주간 행동',
  '장비 상점',
  '대회',
  '선수 기록',
  '게임 안내',
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

export type SeasonActionOption = {
  id: Action;
  title: string;
  desc: string;
  focus: string;
  load: string;
  rankedMatches: number;
};

export const SEASON_ACTIONS: SeasonActionOption[] = [
  {
    id: 'rank',
    title: '랭크 게임',
    desc: '랭크 중심 실전 운영',
    focus: '교전 · 판단 · RP',
    load: '피로 높음',
    rankedMatches: 28,
  },
  {
    id: 'physical',
    title: '피지컬 훈련',
    desc: '훈련·실전·회복 균형',
    focus: '피지컬 · 교전',
    load: '피로 중간',
    rankedMatches: 12,
  },
  {
    id: 'macro',
    title: '운영 훈련',
    desc: '분석·랭크·회복 균형',
    focus: '운영 · 판단',
    load: '피로 중간',
    rankedMatches: 12,
  },
  {
    id: 'specialist',
    title: '실험체 집중 연습',
    desc: '숙련도 중심 시즌 운영',
    focus: '주력 숙련도 · 집중력',
    load: '피로 중간',
    rankedMatches: 12,
  },
  {
    id: 'review',
    title: '리플레이 분석',
    desc: '리뷰·운영 중심 시즌',
    focus: '적응력 · 멘탈',
    load: '피로 낮음',
    rankedMatches: 12,
  },
  {
    id: 'team',
    title: '팀 합동 연습',
    desc: '합동 연습·실전 운영',
    focus: '팀워크 · 로스터 폼',
    load: '피로 중간',
    rankedMatches: 12,
  },
  {
    id: 'rest',
    title: '휴식',
    desc: '회복·재정비 시즌 운영',
    focus: '컨디션 · 멘탈',
    load: '피로 매우 낮음',
    rankedMatches: 8,
  },
];
