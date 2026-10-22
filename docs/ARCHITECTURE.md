# 코드 구조와 개발 원칙

## 책임 경계

- `src/engine/game.ts`: 커리어 상태와 순수 상태 전이 함수
- `src/engine/career.ts`: 통산 집계·은퇴·명예의 전당 상태 전이
- `src/engine/rank.ts`: RP 구간·티어·랭크 입장료 계산
- `src/engine/tournament.ts`: 마스터즈·KEL 라운드 시뮬레이션과 픽 제한
- `src/engine/save.ts`: 저장 데이터 검증·마이그레이션·기본값 보완
- `src/engine/random.ts`: 재현 가능한 시뮬레이션을 위한 난수 소스
- `src/engine/careerRules.ts`: 대회·팀 진입 조건을 계산하는 순수 정책
- `src/components/CreateCareer.tsx`: 신규 커리어 생성 마법사
- `src/components/CareerPanels.tsx`: 계약·로스터·실험체 풀·기록 패널
- `src/components/SaveControls.tsx`: 저장 관리 모달·JSON 가져오기 미리보기·초기화 확인·토스트 피드백
- `src/components/ToastProvider.tsx`: 게임 전역 알림 수명주기와 접근성 라이브 영역
- `src/components/SecondaryViews.tsx`: 장비 상점·선수 기록·게임 안내 화면
- `src/components/SeasonCenter.tsx`: 마스터즈·KEL 시즌 일정과 누적 순위 화면
- `src/components/SeasonPlanner.tsx`: 시즌 방향 비교·확인과 직전 시즌 결과 요약
- `src/components/TournamentView.tsx`: 커리어 진입 무대·공식 대회 진행과 결과 화면
- `src/components/TeamHub.tsx`: 팀 요약·주전 교체·계약과 이적 비교 화면
- `src/components/AppNavigation.tsx`: 데스크톱·모바일 탐색과 저장 관리 진입점
- `src/hooks/useCareerGame.ts`: 커리어 상태와 브라우저 저장 수명주기
- `src/constants/ui.ts`: 화면 공통 라벨·탭·시즌 행동 정의
- `src/utils/careerCard.ts`: 읽기 전용 커리어 카드 렌더링
- `src/main.tsx`: 진행 중인 커리어 화면과 사용자 동작 조합

UI는 게임 규칙을 직접 계산하지 않고 엔진 함수를 호출한다. 엔진 함수는 입력 `Game`을 직접 변경하지 않고 새 상태를 반환한다. 공식 규칙과 팬게임용 수치·확률은 문서와 UI에서 구분한다.

대회·팀 진입 버튼의 활성 조건은 `careerRules` 선택자를 공유한다. 화면과 상태 전이 함수가 같은 임계값을 중복 정의하지 않도록 새 진입 조건은 먼저 정책 모듈에 추가한다.

확률을 사용하는 선수 생성, 랭크, 시즌, 지역 컵, 로스터 구성과 대회 시뮬레이터는 기본적으로 `Math.random`을 사용하되 테스트와 밸런스 도구에서 난수 소스를 주입할 수 있게 설계한다. 동일 시드 테스트는 장기 커리어와 대회 결과가 재현되는지 확인한다.

## 저장 호환성

브라우저 키는 `iron-to-fame-save-v1`을 유지하고 내부 `version`으로 스키마를 관리한다. `migrateGameSave`는 알 수 없는 입력을 검증하고 현재 버전의 필수 필드를 보완한다. 파싱 불가능하거나 복구할 수 없는 데이터는 새 커리어 화면으로 안전하게 복귀시킨다.

사용자는 저장 관리 모달에서 현재 진행을 확인하고 JSON 파일로 내보내거나 다시 불러올 수 있다. 가져온 파일은 동일한 마이그레이션을 통과한 뒤 선수·시즌·랭크·주 실험체·팀·버전 요약을 먼저 표시하며, 사용자가 적용을 선택해야 현재 커리어를 교체한다. 새 커리어 초기화도 모달 안의 2단계 확인 후 수행한다.

## 검증

```bash
npm run check
```

`check`는 Prettier 형식, ESLint 정적 규칙, TypeScript 타입, 단위 테스트와 배포 빌드를 순서대로 검증한다. 단위 테스트는 진입 조건, 대회 규칙, 계약·로스터·은퇴 상태 전이를 검증한다. 장기 회귀 테스트는 고정 난수로 30시즌을 진행하며 능력치, 재화, 주차, 실험체 풀과 주전 인원 불변식을 확인한다. jsdom 기반 UI 테스트는 저장 가져오기 미리보기·적용, 초기화 확인과 키보드 포커스 복귀를 실제 사용자 입력 흐름으로 검증한다.

## 변경 원칙

1. 데이터 모델을 먼저 변경하고 저장 마이그레이션 기본값을 함께 추가한다.
2. 규칙은 엔진의 순수 함수로 구현한 뒤 테스트를 작성한다.
3. UI는 검증된 엔진 함수만 호출한다.
4. 배포 빌드와 문서를 같은 변경에서 갱신한다.
5. GitHub Actions에서 포맷, 린트, 타입 검사, 테스트, 배포 빌드를 같은 순서로 반복한다.
