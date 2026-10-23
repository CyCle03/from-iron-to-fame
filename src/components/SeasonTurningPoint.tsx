import { resolveSeasonTurningPoint, type Game, type SeasonTurningPoint } from '../engine/game';

type Props = { game: Game; onChange: (game: Game) => void };

const choices: { id: SeasonTurningPoint; title: string; detail: string; outcome: string }[] = [
  {
    id: 'pool',
    title: '밴픽 대응 폭 넓히기',
    detail: '보조 실험체를 집중 분석해 다음 메타 변화에 대비합니다.',
    outcome: '보조 실험체 숙련도 +7 · 적응력 +2',
  },
  {
    id: 'team',
    title: '스쿼드 호흡 다지기',
    detail: '로스터와 교전 콜을 맞추며 다음 공식 일정을 준비합니다.',
    outcome: '팀워크 +4 · 멘탈 +3 · 주전 폼 +4',
  },
  {
    id: 'analysis',
    title: '패배 로그 분석하기',
    detail: '안전 구역 전환과 교전 진입 판단을 다시 점검합니다.',
    outcome: '운영 +3 · 판단 +3 · 멘탈 +1',
  },
];

export function SeasonTurningPoint({ game, onChange }: Props) {
  if (!game.turningPointAvailable) return null;
  return (
    <section className="turning-point panel" aria-labelledby="turning-point-title">
      <div>
        <p className="eyebrow">SEASON TURNING POINT</p>
        <h2 id="turning-point-title">다음 시즌 전, 무엇을 우선할까요?</h2>
        <p>한 가지만 선택하세요. 선택 결과는 즉시 적용되며 이번 시즌에는 바꿀 수 없습니다.</p>
      </div>
      <div className="turning-point-choices">
        {choices.map((choice) => (
          <button key={choice.id} onClick={() => onChange(resolveSeasonTurningPoint(game, choice.id))}>
            <b>{choice.title}</b>
            <small>{choice.detail}</small>
            <em>{choice.outcome}</em>
          </button>
        ))}
      </div>
    </section>
  );
}
