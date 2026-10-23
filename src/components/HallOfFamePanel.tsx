import { hallOfFameProgress, majorTitleCount, receiveHallHonor, type Game } from '../engine/game';

type Props = {
  game: Game;
  onChange: (game: Game) => void;
};

const allComplete = (requirements: Record<string, boolean>) => Object.values(requirements).every(Boolean);

export function HallOfFamePanel({ game, onChange }: Props) {
  const progress = hallOfFameProgress(game);
  const majorTitles = majorTitleCount(game);
  const isHero = game.hallOfFameHonors.includes('히어로즈');

  return (
    <section className="hall-panel panel hall-categories">
      <div className="hall-heading">
        <p className="eyebrow">ESPORTS HALL OF FAME</p>
        <h2>세 가지 선정 기록</h2>
        <small>스타즈·히어로즈·아너스는 순차 승급이 아닌 서로 다른 선정 부문입니다.</small>
      </div>
      <div className="hall-category-grid">
        <article>
          <strong>스타즈</strong>
          <em>연간 팬 투표 선정</em>
          <div className="hof-reqs">
            <span className={progress.stars.awareness ? 'done' : ''}>인지도 70/100</span>
            <span className={progress.stars.mastersAppearance ? 'done' : ''}>마스터즈 출전 경력</span>
            <span className={progress.stars.topTierPodium ? 'done' : ''}>직전 시즌 마스터즈·KEL TOP3</span>
          </div>
          <button
            disabled={!allComplete(progress.stars)}
            onClick={() => onChange(receiveHallHonor(game, '스타즈'))}
          >
            {game.lastStarsSeason === game.season
              ? `S${game.season} 선정 완료`
              : `팬 투표 결과 · 통산 ${game.starsSelections}회`}
          </button>
        </article>
        <article>
          <strong>히어로즈</strong>
          <em>현역 메이저 업적</em>
          <div className="hof-reqs">
            <span className={progress.heroes.majorTitles ? 'done' : ''}>메이저 우승 {majorTitles}/3</span>
          </div>
          <button
            disabled={isHero || !allComplete(progress.heroes)}
            onClick={() => onChange(receiveHallHonor(game, '히어로즈'))}
          >
            {isHero ? '히어로즈 선정 완료' : '히어로즈 심사'}
          </button>
        </article>
        <article>
          <strong>아너스</strong>
          <em>은퇴 선수 영구 헌액</em>
          <div className="hof-reqs">
            <span>은퇴 후 기록 보관소에서 심사</span>
          </div>
          <button disabled>아너스는 은퇴 후</button>
        </article>
      </div>
    </section>
  );
}
