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
  const game = createGame('현재 선수', '아이언', '일반 유저', '유키');
  render(
    <ToastProvider>
      <SaveControls game={game} onImport={onImport} onReset={onReset} />
    </ToastProvider>,
  );
  return { game, onImport, onReset };
};

describe('SaveControls user flow', () => {
  it('previews a selected save before applying it', async () => {
    const user = userEvent.setup();
    const { onImport } = renderControls();
    const imported = createGame('가져온 선수', '골드', '일반 유저', '아야');
    const file = new File([serializeGameSave(imported)], 'career.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => serializeGameSave(imported) });

    await user.click(screen.getByRole('button', { name: '저장·새 커리어' }));
    expect(screen.getByRole('button', { name: '저장 관리 닫기' })).toBe(document.activeElement);
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
    const trigger = screen.getByRole('button', { name: '저장·새 커리어' });

    await user.click(trigger);
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: '새 커리어 시작' })).toBe(document.activeElement);
    await user.tab();
    expect(screen.getByRole('button', { name: '저장 관리 닫기' })).toBe(document.activeElement);
    await user.click(screen.getByRole('button', { name: '새 커리어 시작' }));
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(onReset).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toBe(document.activeElement));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('requires a second action before resetting the career', async () => {
    const user = userEvent.setup();
    const { onReset } = renderControls();

    await user.click(screen.getByRole('button', { name: '저장·새 커리어' }));
    await user.click(screen.getByRole('button', { name: '새 커리어 시작' }));
    expect(onReset).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '진행 삭제' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
