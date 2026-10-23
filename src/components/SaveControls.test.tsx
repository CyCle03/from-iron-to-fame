// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGame } from '../engine/game';
import { serializeGameSave } from '../engine/save';
import { SaveControls } from './SaveControls';
import { ToastProvider } from './ToastProvider';

afterEach(cleanup);

const renderControls = () => {
  const onImport = vi.fn();
  const onReset = vi.fn();
  const onRetire = vi.fn();
  const game = createGame('현재 선수', '아이언', '일반 유저', '유키');
  render(
    <ToastProvider>
      <SaveControls game={game} onImport={onImport} onReset={onReset} onRetire={onRetire} />
    </ToastProvider>,
  );
  return { game, onImport, onReset, onRetire };
};

describe('SaveControls user flow', () => {
  it('previews a selected save before applying it', async () => {
    const user = userEvent.setup();
    const { onImport } = renderControls();
    const imported = createGame('가져온 선수', '골드', '일반 유저', '아야');
    const file = new File([serializeGameSave(imported)], 'career.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => serializeGameSave(imported) });

    await user.click(screen.getByRole('button', { name: '커리어 관리' }));
    expect(screen.getByRole('button', { name: '커리어 관리 닫기' })).toBe(document.activeElement);
    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file);

    expect(await screen.findByText('가져온 선수')).toBeTruthy();
    expect(onImport).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '이 저장 적용' }));
    expect(onImport).toHaveBeenCalledWith(imported);
    expect(await screen.findByText('저장 파일을 적용했습니다.')).toBeTruthy();
  });

  it('supports cancelling reset and returns focus after Escape', async () => {
    const user = userEvent.setup();
    const { onReset } = renderControls();
    const trigger = screen.getByRole('button', { name: '커리어 관리' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '데이터 삭제 후 새 커리어' }));
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onReset).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toBe(document.activeElement));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('requires a second action before deleting the career data', async () => {
    const user = userEvent.setup();
    const { onReset } = renderControls();

    await user.click(screen.getByRole('button', { name: '커리어 관리' }));
    await user.click(screen.getByRole('button', { name: '데이터 삭제 후 새 커리어' }));
    expect(onReset).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '데이터 삭제 확정' }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('requires confirmation before preserving and retiring a career', async () => {
    const user = userEvent.setup();
    const { onRetire, onReset } = renderControls();

    await user.click(screen.getByRole('button', { name: '커리어 관리' }));
    await user.click(screen.getByRole('button', { name: '선수 은퇴' }));
    expect(onRetire).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '은퇴 확정' }));
    expect(onRetire).toHaveBeenCalledOnce();
    expect(onReset).not.toHaveBeenCalled();
  });
});
