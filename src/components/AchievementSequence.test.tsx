// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AchievementSequence } from './AchievementSequence';

afterEach(cleanup);
describe('AchievementSequence', () => {
  it('shows ordered results and lets the player skip the remaining sequence', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(
      <AchievementSequence
        events={[
          { title: 'KeG 전국결선 우승', detail: '1위 · 인지도 +5', category: '대회 결과', repeat: false },
          { title: 'KEL MVP', detail: '공식 대회 수상', category: '개인 수상', repeat: false },
        ]}
        onClose={close}
      />,
    );
    expect(screen.getByRole('dialog').textContent).toContain('KeG 전국결선 우승');
    await user.click(screen.getByRole('button', { name: '다음 결과' }));
    expect(screen.getByRole('dialog').textContent).toContain('KEL MVP');
    await user.click(screen.getByRole('button', { name: '모두 건너뛰기' }));
    expect(close).toHaveBeenCalledOnce();
  });
});
