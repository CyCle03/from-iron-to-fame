// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame, runSeason } from '../engine/game';
import { SeasonRecapSummary } from './SeasonRecapSummary';

afterEach(cleanup);

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
});
