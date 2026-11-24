// @vitest-environment jsdom

import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame, runSeason, type Game } from '../engine/game';
import { SeasonRecapSummary } from './SeasonRecapSummary';

afterEach(cleanup);

function RecapHarness({ game, onClose }: { game: Game; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>결산 열기</button>
      <SeasonRecapSummary
        game={game}
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
      />
    </>
  );
}

describe('SeasonRecapSummary', () => {
  it('moves from the headline through rank details to the next-story inbox', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const base = {
      ...createGame('레퍼런스', '골드', '일반 유저', '유키'),
      fame: 200,
      mastersPoints: 500,
      rp: 9600,
    };
    const game = runSeason(base, 'rank', () => 0.5);

    render(<SeasonRecapSummary game={game} open onClose={onClose} />);
    expect(screen.getByText('시즌의 결론')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('랭크 경기 리포트')).toBeTruthy();
    expect(screen.getByText('평균 순위')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('다음 이야기가 도착했습니다')).toBeTruthy();
    expect(screen.getByText('성장 전환점')).toBeTruthy();
    expect(screen.getByText(/팀 제안/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '다음 시즌 준비' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focuses the dialog, traps Tab, and restores focus and scroll on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const game = runSeason(
      {
        ...createGame('레퍼런스', '골드', '일반 유저', '유키'),
        fame: 200,
        mastersPoints: 500,
        rp: 9600,
      },
      'rank',
      () => 0.5,
    );

    render(<RecapHarness game={game} onClose={onClose} />);
    const trigger = screen.getByRole('button', { name: '결산 열기' });
    await user.click(trigger);

    const closeButton = screen.getByRole('button', { name: '시즌 결산 닫기' });
    expect(closeButton).toBe(document.activeElement);
    expect(document.body.style.overflow).toBe('hidden');

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: '다음' })).toBe(document.activeElement);
    await user.tab();
    expect(closeButton).toBe(document.activeElement);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toBe(document.activeElement));
    expect(document.body.style.overflow).toBe('');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
