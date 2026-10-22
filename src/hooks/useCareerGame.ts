import { useEffect, useState } from 'react';
import type { Game } from '../engine/game';
import { migrateGameSave } from '../engine/save';
import { SAVE_KEY } from '../constants/ui';

function loadSavedGame(): Game | null {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;

  try {
    const migrated = migrateGameSave(JSON.parse(saved));
    if (migrated) return migrated;
  } catch {
    // Invalid JSON is handled by removing the unusable save below.
  }

  localStorage.removeItem(SAVE_KEY);
  return null;
}

export function useCareerGame() {
  const [game, setGame] = useState<Game | null>(loadSavedGame);

  useEffect(() => {
    if (game) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setGame(null);
  };

  return { game, setGame, resetGame };
}
