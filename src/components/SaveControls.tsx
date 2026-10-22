import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from '../engine/game';
import { getSavePreview, parseGameSave, serializeGameSave } from '../engine/save';
import { useToast } from './ToastProvider';

type SaveControlsProps = { game: Game; onImport: (game: Game) => void; onReset: () => void };

export function SaveControls({ game, onImport, onReset }: SaveControlsProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Game | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { notify } = useToast();
  const triggerButton = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const closeModal = useCallback(() => {
    setOpen(false);
    setConfirmReset(false);
    window.setTimeout(() => triggerButton.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
      if (event.key !== 'Tab') return;
      const modal = closeButton.current?.closest('[role="dialog"]');
      const focusable = modal?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => {
      window.removeEventListener('keydown', handleKeyboard);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeModal, open]);

  const exportSave = () => {
    const blob = new Blob([serializeGameSave(game)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iron-to-fame-${game.name}-s${game.season}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('현재 커리어 백업을 내려받았습니다.');
  };

  const inspectFile = async (file?: File) => {
    if (!file) return;
    const imported = parseGameSave(await file.text());
    setPreview(imported);
    if (!imported) notify('불러올 수 없는 저장 파일입니다.', 'error');
    if (fileInput.current) fileInput.current.value = '';
  };

  const applyImport = () => {
    if (!preview) return;
    onImport(preview);
    setPreview(null);
    closeModal();
    notify('저장 파일을 적용했습니다.');
  };

  const reset = () => {
    onReset();
    setOpen(false);
    setConfirmReset(false);
  };

  const importSummary = preview ? getSavePreview(preview) : null;

  return (
    <>
      <button ref={triggerButton} onClick={() => setOpen(true)}>
        저장·새 커리어
      </button>
      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section className="save-modal" role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">SAVE MANAGER</p>
                <h2 id="save-modal-title">저장 관리</h2>
              </div>
              <button ref={closeButton} aria-label="저장 관리 닫기" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="save-summary">
              <span>
                <small>선수</small>
                <b>{game.name}</b>
              </span>
              <span>
                <small>진행</small>
                <b>
                  S{game.season} · {game.rank}
                </b>
              </span>
              <span>
                <small>팀</small>
                <b>{game.teamName ?? '무소속'}</b>
              </span>
            </div>
            <div className="save-actions">
              <button onClick={exportSave}>JSON 백업 내려받기</button>
              <button onClick={() => fileInput.current?.click()}>저장 파일 선택</button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => void inspectFile(event.target.files?.[0])}
              />
            </div>
            {importSummary && (
              <div className="import-preview">
                <p className="eyebrow">IMPORT PREVIEW</p>
                <h3>{importSummary.name}</h3>
                <p>
                  S{importSummary.season} · {importSummary.rank} · {importSummary.main}
                </p>
                <small>
                  {importSummary.teamName ?? '무소속'} · 저장 버전 {importSummary.version}
                </small>
                <div>
                  <button onClick={() => setPreview(null)}>취소</button>
                  <button className="primary" onClick={applyImport}>
                    이 저장 적용
                  </button>
                </div>
              </div>
            )}
            <div className="reset-zone">
              <b>새 커리어</b>
              <p>현재 브라우저의 진행을 지웁니다. 먼저 JSON 백업을 내려받을 수 있습니다.</p>
              {confirmReset ? (
                <div>
                  <button onClick={() => setConfirmReset(false)}>취소</button>
                  <button className="danger" onClick={reset}>
                    진행 삭제
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)}>새 커리어 시작</button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
