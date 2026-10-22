import {useRef} from 'react';
import type {Game} from '../engine/game';
import {parseGameSave, serializeGameSave} from '../engine/save';

type SaveControlsProps = {
  game: Game;
  onImport: (game: Game) => void;
  onReset: () => void;
};

export function SaveControls({game, onImport, onReset}: SaveControlsProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const exportSave = () => {
    const blob = new Blob([serializeGameSave(game)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iron-to-fame-${game.name}-s${game.season}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSave = async (file?: File) => {
    if (!file) return;
    const imported = parseGameSave(await file.text());
    if (!imported) {
      window.alert('불러올 수 없는 저장 파일입니다.');
      return;
    }
    onImport(imported);
  };

  const reset = () => {
    if (window.confirm('현재 커리어를 삭제하고 새로 시작할까요? 내보내지 않은 진행은 복구할 수 없습니다.')) onReset();
  };

  return <>
    <button onClick={exportSave}>저장 내보내기</button>
    <button onClick={() => fileInput.current?.click()}>저장 불러오기</button>
    <input
      ref={fileInput}
      type="file"
      accept="application/json,.json"
      hidden
      onChange={(event) => void importSave(event.target.files?.[0])}
    />
    <button onClick={reset}>새 커리어</button>
  </>;
}
