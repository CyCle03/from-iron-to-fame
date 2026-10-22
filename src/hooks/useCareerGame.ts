import {useEffect, useState} from 'react';
import type {Game} from '../engine/game';
import {migrateGameSave} from '../engine/save';
import {SAVE_KEY} from '../constants/ui';

export function useCareerGame() {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;

    try {
      const migrated = migrateGameSave(JSON.parse(saved));
      if (migrated) setGame(migrated);
      else localStorage.removeItem(SAVE_KEY);
    } catch {
      localStorage.removeItem(SAVE_KEY);
    }
  }, []);

  useEffect(() => {
    if (game) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setGame(null);
  };

  return {game, setGame, resetGame};
}
