// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame } from '../engine/game';
import { CareerArchivePanel } from './CareerPanels';

afterEach(cleanup);

const renderArchive = () => {
  const onChange = vi.fn();
  const game = createGame('은퇴 후보', '골드', '일반 유저', '유키');
  render(<CareerArchivePanel game={game} onChange={onChange} />);
  return { onChange };
};

describe('CareerArchivePanel retirement flow', () => {
  it('waits for confirmation and allows cancelling', async () => {
    const user = userEvent.setup();
    const { onChange } = renderArchive();

    await user.click(screen.getByRole('button', { name: '현역 은퇴 및 기록 보존' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '은퇴 확정' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '현역 은퇴 및 기록 보존' })).toBeTruthy();
  });

  it('confirms retirement from the keyboard', async () => {
    const user = userEvent.setup();
    const { onChange } = renderArchive();

    await user.click(screen.getByRole('button', { name: '현역 은퇴 및 기록 보존' }));
    const cancel = screen.getByRole('button', { name: '취소' });
    expect(cancel).toBe(document.activeElement);

    await user.tab();
    expect(screen.getByRole('button', { name: '은퇴 확정' })).toBe(document.activeElement);
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ retired: true }));
  });
});
