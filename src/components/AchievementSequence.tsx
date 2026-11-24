import { useState } from 'react';
import type { CareerAchievement } from '../application/careerAchievements';
import { useModalDialog } from '../hooks/useModalDialog';

type Props = { events: CareerAchievement[]; onClose: () => void };

export function AchievementSequence({ events, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const { ref } = useModalDialog(true, onClose);
  const event = events[index];
  return (
    <div className="season-recap-backdrop">
      <section
        ref={ref}
        className="season-recap achievement-sequence"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-title"
        tabIndex={-1}
      >
        <header>
          <p className="eyebrow">
            {event.category} · {index + 1}/{events.length}
          </p>
          <button className="recap-close" onClick={onClose} aria-label="성취 연출 닫기">
            ×
          </button>
        </header>
        <div className="recap-page" aria-live="polite">
          <p>
            {event.title.includes('우승')
              ? '🏆 우승 기록'
              : event.repeat
                ? '다시 이룬 성취'
                : '새로운 커리어 기록'}
          </p>
          <h2 id="achievement-title">{event.title}</h2>
          {(!event.repeat || event.category === '대회 결과') && <p>{event.detail}</p>}
          <small>기록은 이미 저장되었습니다. 건너뛰어도 기록은 유지됩니다.</small>
        </div>
        <div className="recap-story-actions">
          <button className="secondary" onClick={onClose}>
            모두 건너뛰기
          </button>
          <button onClick={() => (index + 1 < events.length ? setIndex(index + 1) : onClose())}>
            {index + 1 < events.length ? '다음 결과' : '확인'}
          </button>
        </div>
      </section>
    </div>
  );
}
