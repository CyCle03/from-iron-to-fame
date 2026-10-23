// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createGame, runSeason } from '../engine/game';
import { HallOfFamePanel } from './HallOfFamePanel';

afterEach(cleanup);

describe('HallOfFamePanel', () => {
  it('does not present a Platinum player with inflated recognition as a Stars candidate', () => {
    const game = runSeason(createGame('플래티넘 선수', '플래티넘', '일반 유저', '유키'), 'rank', () => 0.5);
    game.fame = 100;

    render(<HallOfFamePanel game={game} onChange={vi.fn()} />);

    const starsButton = screen.getByRole('button', { name: '선정 조건 미충족' });
    expect((starsButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('현재 데미갓 이상 · 소속 팀').className).not.toContain('done');
    expect(screen.getByText('마스터즈 출전 경력').className).not.toContain('done');
  });
});
