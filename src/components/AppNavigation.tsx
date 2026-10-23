import type { Game } from '../engine/game';
import { NAVIGATION_TABS, type NavigationTab } from '../constants/ui';
import { SaveControls } from './SaveControls';

type AppNavigationProps = {
  game: Game;
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onImport: (game: Game) => void;
  onReset: () => void;
};

const labels: Record<NavigationTab, string> = {
  대시보드: '홈',
  '시즌 센터': '시즌',
  '시즌 플랜': '훈련',
  팀: '팀',
  '장비 상점': '장비',
  대회: '대회',
  '선수 기록': '기록',
  '게임 안내': '안내',
};

export function AppNavigation({ game, activeTab, onNavigate, onImport, onReset }: AppNavigationProps) {
  return (
    <nav className="app-navigation" aria-label="주요 메뉴">
      <div className="navigation-tabs">
        {NAVIGATION_TABS.map((tab) => (
          <button
            key={tab}
            aria-current={activeTab === tab ? 'page' : undefined}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onNavigate(tab)}
          >
            <span>{labels[tab]}</span>
            <small>{tab}</small>
          </button>
        ))}
      </div>
      <details className="save-menu">
        <summary>더보기</summary>
        <div>
          <button className="mobile-secondary" onClick={() => onNavigate('장비 상점')}>
            장비 상점
          </button>
          <button className="mobile-secondary" onClick={() => onNavigate('게임 안내')}>
            게임 안내
          </button>
          <SaveControls game={game} onImport={onImport} onReset={onReset} />
        </div>
      </details>
    </nav>
  );
}
