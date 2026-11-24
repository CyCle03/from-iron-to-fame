import { useEffect, useEffectEvent, useRef, type MouseEvent, type RefObject } from 'react';

type ModalDialogOptions = {
  /** Element focused when the dialog opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Element focused when the dialog closes. Defaults to the element active before opening. */
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

type ModalDialogHandle<T extends HTMLElement> = {
  /** Attach to the element that contains the dialog content (usually the `role="dialog"` node). */
  ref: RefObject<T | null>;
  /** Attach to the backdrop when clicking outside the dialog should close it. */
  onBackdropMouseDown: (event: MouseEvent<HTMLElement>) => void;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.closest('[hidden]') && element.getAttribute('aria-hidden') !== 'true',
  );
}

/**
 * Shared dialog behavior: initial focus, Tab trap, Escape to close, focus return and
 * background scroll lock. The caller renders the dialog conditionally, and attaches
 * the returned `ref` to the dialog content.
 */
export function useModalDialog<T extends HTMLElement = HTMLElement>(
  open: boolean,
  onClose: () => void,
  { initialFocusRef, restoreFocusRef }: ModalDialogOptions = {},
): ModalDialogHandle<T> {
  const ref = useRef<T>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const restoreTarget =
      restoreFocusRef?.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    (initialFocusRef?.current ?? getFocusableElements(dialog)[0] ?? dialog)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(ref.current);
      if (!focusable.length) {
        event.preventDefault();
        ref.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!ref.current?.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === ref.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (restoreTarget?.isConnected) restoreTarget.focus();
    };
  }, [initialFocusRef, open, restoreFocusRef]);

  return {
    ref,
    onBackdropMouseDown: (event) => {
      if (event.target === event.currentTarget) onClose();
    },
  };
}
