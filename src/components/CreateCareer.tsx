import { useState } from 'react';
import {
  backgrounds,
  createGame,
  ranks,
  roleDescriptions,
  roleExperiments,
  type Background,
  type Game,
  type Rank,
  type Role,
  type StatKey,
} from '../engine/game';
import { STAT_LABELS } from '../constants/ui';

type CreateCareerProps = { onCreate: (game: Game) => void };

export function CreateCareer({ onCreate }: CreateCareerProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('루미아 신인');
  const [rank, setRank] = useState<Rank>('아이언');
  const [background, setBackground] = useState<Background>('일반 유저');
  const [role, setRole] = useState<Role>('근거리 딜러');
  const [focusA, setFocusA] = useState<StatKey>('physical');
  const [focusB, setFocusB] = useState<StatKey>('macro');

  const begin = () => {
    const candidates = roleExperiments[role];
    const main = candidates[Math.floor(Math.random() * candidates.length)];
    onCreate(createGame(name.trim() || '루미아 신인', rank, background, role, main, [focusA, focusB]));
  };

  return (
    <main className="create wizard">
      <p className="eyebrow">선수 만들기 · {step + 1}/4</p>
      <h1>
        광물에서 <em>명전까지</em>
      </h1>
      <section>
        {step === 0 && (
          <>
            <h2>선수 프로필</h2>
            <label>
              선수 닉네임
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={12} />
            </label>
            <label>
              시작 랭크
              <select value={rank} onChange={(event) => setRank(event.target.value as Rank)}>
                {ranks.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <div className="backgrounds">
              {Object.entries(backgrounds).map(([key, value]) => (
                <button
                  key={key}
                  className={background === key ? 'selected' : ''}
                  onClick={() => setBackground(key as Background)}
                >
                  <b>{key}</b>
                  <small>{value.desc}</small>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2>플레이 역할군</h2>
            <p>주력 실험체는 선택한 역할군 안에서 무작위로 정해집니다.</p>
            <fieldset className="roles">
              {Object.keys(roleExperiments).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={role === item ? 'selected' : ''}
                  onClick={() => setRole(item as Role)}
                >
                  <b>{item}</b>
                  <small>
                    {roleDescriptions[item as Role]} · {roleExperiments[item as Role].length}명
                  </small>
                  <span className="role-roster">
                    {roleExperiments[item as Role].slice(0, 6).join(' · ')}
                    {roleExperiments[item as Role].length > 6 ? ' 외' : ''}
                  </span>
                </button>
              ))}
            </fieldset>
          </>
        )}
        {step === 2 && (
          <>
            <h2>성장 중점</h2>
            <p>시즌 시작 이벤트로 바뀔 수 있지만, 초기 성장 방향을 정합니다.</p>
            <div className="focus-select">
              <label>
                중점 1
                <select value={focusA} onChange={(event) => setFocusA(event.target.value as StatKey)}>
                  {Object.entries(STAT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                중점 2
                <select value={focusB} onChange={(event) => setFocusB(event.target.value as StatKey)}>
                  {Object.entries(STAT_LABELS).map(([key, label]) => (
                    <option key={key} value={key} disabled={key === focusA}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>커리어 시작</h2>
            <div className="wizard-summary">
              <b>{name || '루미아 신인'}</b>
              <span>
                {rank} · {role}
              </span>
              <span>
                성장 중점 · {STAT_LABELS[focusA]} · {STAT_LABELS[focusB]}
              </span>
              <small>주력 실험체와 3인 스쿼드는 커리어 시작 시 정해집니다.</small>
            </div>
          </>
        )}
        <div className="wizard-actions">
          {step > 0 && <button onClick={() => setStep(step - 1)}>이전</button>}
          {step < 3 ? (
            <button className="primary" onClick={() => setStep(step + 1)}>
              다음
            </button>
          ) : (
            <button className="primary" onClick={begin}>
              커리어 시작
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
