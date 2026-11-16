# AGENTS.md — From Iron to Fame

이 문서는 이 저장소에서만 적용하는 작업 지침이다. 범용 정책 모음이 아니며, 프로젝트 고유 제약이 일반 지식 저장소 지침보다 우선한다. 기준일: 2026-11-16.

## 저장소 관계

- 이 저장소와 지식 저장소 [`../dev-knowledge-base`](../dev-knowledge-base/)는 서로 **독립적인 Git 저장소**다. submodule, vendor 복사, 동기화 스크립트, 문서 내용 복제를 만들지 않는다.
- 지식 저장소를 쓸 때는 먼저 [`AGENTS.md`](../dev-knowledge-base/AGENTS.md)를 읽고, 이번 작업에 필요한 `SKILL.md`와 관련 기록만 읽는다.
- 지식 저장소가 없으면 기대 경로를 보고하고 이 문서의 프로젝트 규칙으로 진행한다. 없는 지식을 적용했다고 쓰지 않으며, 충돌하는 폴더를 자동으로 clone하지 않는다.

## 필수 원칙

1. **작업 전 관련 지식 검색.** 프로젝트명, 오류의 고유 문구, 기술·버전, 관련 태그로 검색한다. 예: `rg -n -i -F --glob '*.md' -- '<검색어>' ../dev-knowledge-base/projects ../dev-knowledge-base/knowledge ../dev-knowledge-base/lessons`. [knowledge-retrieval](../dev-knowledge-base/skills/knowledge-retrieval/SKILL.md)의 적용 조건·근거 확인 절차를 따른다.
2. **관련 문서만 읽는다.** README·문서 목록·필요한 소스와 테스트로 범위를 좁힌다. 저장소 전체를 훑거나 무관한 파일을 읽지 않는다.
3. **적용한 KB 문서 경로를 남긴다.** 실제로 참고한 문서의 저장소 상대 경로를 작업 계획/보고 또는 관련 프로젝트 문서에 적는다. 매 작업마다 새 로그 문서를 만들 필요는 없다.
4. **프로젝트 제약과 일반 지식을 구분한다.** 이 문서, `docs/*`, 테스트가 프로젝트 고유 제약이고 KB의 일반 지식은 후보다. 충돌하면 해당 작업 범위에서는 프로젝트 제약을 우선하되 KB 원문을 임의로 덮어쓰지 않고, 차이와 재검증 조건을 계획/보고에 남긴다.
5. **AI 추측을 승격하지 않는다.** 관찰, 추론, 미확인을 구분한다. 도구 출력·테스트·실행 화면으로 확인하지 않은 내용은 `verified`로 쓰지 않는다.
6. **작업 끝에 재사용 학습을 식별한다.** 프로젝트 고유 결정과 다른 프로젝트에도 쓸 지식을 나눈다. 재사용 후보는 증상·환경·버전·근거·한계가 있을 때만 KB 기록 대상으로 삼는다.
7. **KB 갱신 전 중복을 확인한다.** 같은 기술·문제·조건의 기존 기록을 먼저 검색하고, 있으면 대표 문서에 근거를 보강하며 상대경로로 연결한다. 기록 위치는 `projects/`(프로젝트 맥락·결정), `knowledge/`(재사용 지식), `lessons/`(실패 사례), `skills/`(작업 절차), `templates/`(메타데이터 양식)를 따른다. 기존 [`projects/from-iron-to-fame/summary.md`](../dev-knowledge-base/projects/from-iron-to-fame/summary.md)를 재사용하고 새 프로젝트 요약을 중복 생성하지 않는다.
8. **Git 소유권을 분리한다.** 이 저장소와 지식 저장소의 변경을 한 커밋에 섞지 않는다. 저장소별로 별도 커밋을 만들며, 사용자 승인 없이 자동 커밋·push·merge하지 않는다.

## 작업 흐름

### 시작

- 현재 브랜치와 변경 상태를 읽기 전용으로 확인하고, 각 저장소의 로컬 작업 브랜치에서 작업한다. 브랜치와 변경 범위는 계획/보고에 적는다.
- 관련 KB 기록을 검색해 `status`, `updated`, 적용 조건, `sources`, 검증 결과를 현재 환경과 대조한다. [프로젝트 요약](../dev-knowledge-base/projects/from-iron-to-fame/summary.md)과 필요한 ADR·지식·사례만 읽는다.
- KB README의 허용 상태는 `draft`, `verified`, `deprecated`이지만 기존 요약과 일부 지식 문서는 `reviewed`를 쓴다. 기존 `status`와 이력을 보존하고 불일치를 보고하며, `reviewed`를 `verified`로 간주하거나 일괄 정규화하지 않는다. `draft`와 비표준 상태 기록은 자동으로 참인 결론이 아니라 참고 자료로 다룬다.

### 진행

- 계획과 리뷰는 Sol이 맡는다. 구현은 파일 범위를 독립적으로 나눈 DeepSeek 워커가 맡고, 각 워커의 실제 모델 ID와 결과를 계획/보고에 기록한다.
- 같은 파일에는 한 명의 작성자만 둔다. 워커는 빌드·테스트·린트·포맷 게이트를 실행하지 않고, 오케스트레이터가 통합 후 한 번 검증한다.
- 실험과 검증된 결과를 분리한다. 아직 확인하지 않은 시도는 `draft`/실험으로 표시하고, 성공으로 서술하지 않는다.
- 검증 근거에는 명령, 저장소, 날짜, Node/npm과 OS 등 환경·버전, 재현 조건, 결과와 한계를 함께 적는다. 실행하지 않은 검사는 실행했다고 쓰지 않는다.

### 종료

- `npm run check`를 기준 게이트로 사용하고, 실제 실행 결과와 실패 항목을 그대로 보고한다. 게이트를 실행하지 않았으면 그 사실을 명시한다.
- 적용한 KB 문서 경로, 프로젝트 규칙과 KB의 충돌, 미확인 사항, 재사용 학습 후보를 결과에 남긴다.
- 재사용 가능한 학습은 [knowledge-capture](../dev-knowledge-base/skills/knowledge-capture/SKILL.md), 실패 사례는 [lesson-extraction](../dev-knowledge-base/skills/lesson-extraction/SKILL.md), 중복·충돌 정리는 [knowledge-maintenance](../dev-knowledge-base/skills/knowledge-maintenance/SKILL.md)를 따른다. KB 변경은 배정된 파일 범위와 사용자 승인 안에서만 한다.

## 아키텍처·저장 경계

- 의존 방향은 `UI → application → domain`이다. `engine`은 React·브라우저·`application`·`components`·`hooks`를 알지 못한다. 새 시즌 단위 절차는 `main.tsx`가 아니라 application 유스케이스에 둔다. 자세한 규칙은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 따른다.
- UI는 대회 컷·명성·헌액 기준 같은 정책을 중복 계산하지 않고 도메인 선택자를 사용한다.
- 저장 키 `iron-to-fame-save-v1`, 현재 스키마 버전 7, `migrateGameSave` 마이그레이션과 가져오기 미리보기→적용 흐름을 유지한다. 스키마를 바꾸면 마이그레이션과 기존 저장 fixture 테스트를 같은 변경에 포함한다.
- 시뮬레이션은 seed와 순수 계산 경계로 재현성을 유지하고, 경로 동치·보존량·범위 같은 불변식을 검사한다. [결정적 시뮬레이션 지식](../dev-knowledge-base/knowledge/testing/deterministic-simulation-invariants.md)은 적용 조건과 한계를 확인해 참고한다.

## UI/UX

- 기존 게임 방향, 디자인 토큰, 컴포넌트, 한국어 문구, 데스크톱 가로 탐색·모바일 하단 탐색, 모달 포커스 트랩, `prefers-reduced-motion`, 표→카드 전환을 보존한다. 전면 재설계나 새 디자인 시스템 도입은 명시적 요구나 승인 없이는 하지 않는다.
- UI 작업 전에 [docs/UI_UX_PLAN.md](docs/UI_UX_PLAN.md)와 KB의 [UI/UX 지식 목록](../dev-knowledge-base/knowledge/README.md#uiux)을 확인하고, 설계는 [ui-design](../dev-knowledge-base/skills/ui-design/SKILL.md), 평가는 [ui-review](../dev-knowledge-base/skills/ui-review/SKILL.md)를 따른다.
- 다음을 실제 화면 기준으로 검토한다: AI Slop 안티패턴, 기존 디자인 시스템과의 일관성, 시각적 계층, 게임 상태 변화의 피드백(성공·실패·비용·다음 조건), 접근성과 반응형, 불필요한 카드·중첩 카드·그라데이션·장식, 기존 개선 사항의 회귀 여부. 판단 기준은 [AI 생성 UI/UX 안티패턴](../dev-knowledge-base/knowledge/ui-ux/anti-patterns.md)을 사용한다.
- 결정 단계의 카드는 독립된 선택 경계를 표현하는 AP-03의 허용 예외다. 카드 수를 줄이는 정리가 실제 비교·선택 과업을 해치지 않는지 먼저 확인한다.
- 개선은 실제 UI 스모크 증거(화면, 뷰포트, 상태, 조작 결과)가 있을 때만 승격한다. 실행 화면을 확인하지 못한 제안은 `미검증`으로 남기고 완료로 표현하지 않는다.

## 검증·환경

- 기준 게이트는 `npm run check`이며 `format:check → architecture:check → lint → typecheck → test → build` 순서다. GitHub Actions의 검증 단계도 같은 명령을 실행한다. CI는 Node 22를 사용하고 로컬 기본 Node는 24일 수 있으므로 실제 버전을 기록한다.
- 과거 관측(2026-11-16): Windows 체크아웃(시스템 `core.autocrlf=true`, `.gitattributes` 없음)에서 `format:check`가 Prettier 지원 파일 72개에서 실패했다. 이는 과거 기준선이며 통과가 아니다.
- 현재 저장소는 `.gitattributes`의 `* text=auto eol=lf`로 EOL 정책을 LF에 둔다. 새 체크아웃은 LF로 받으며, 정책 추가만으로 이미 체크아웃된 작업 트리는 바뀌지 않으므로 필요하면 승인된 범위에서 포맷터로 작업 트리를 한 번 정규화한다. 정규화 뒤에는 `npm run check` 전체를 다시 실행해 결과를 그대로 기록하고, 통과 근거가 확인되기 전에는 해결됐다고 쓰지 않는다. 합의 범위 밖 파일을 일괄 포맷하거나 포맷 실패를 다른 검사 통과로 대체하지 않는다.

## Git·서버·보안

- 로컬 작업 브랜치를 사용하고, 사용자 승인 없이 커밋·push·merge하지 않는다. 두 저장소의 변경은 각각 별도 커밋으로 남긴다.
- Oracle 서버는 읽기 전용 조사만 승인 없이 할 수 있다. 쓰기, 설치, 재시작, 배포, 설정 변경은 모두 명시적 승인이 필요하다.
- 이 프로젝트의 Oracle 배포 서버에는 `ssh oracle-elcherlab`로 접속한다. 읽기 전용 확인에는 `BatchMode=yes`, `StrictHostKeyChecking=yes`를 사용한다. 이 별칭은 프로젝트 전용이며 지식 저장소의 공통 규칙으로 기록하지 않는다. SSH 설정이나 호스트키를 임의로 바꾸지 않고, 웹 서버와 배포 경로는 실제 설정에서 확인한다.
- 배포는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)의 수동 절차를 따른다. 현재 Caddy 루트, 제안 릴리스 레이아웃, 검증·백업·롤백과 승인 경계는 그 문서에 있다. 서버 쓰기, 설치, 재시작, Caddy reload, 배포는 작업별 명시 승인 없이 실행하지 않으며 CI는 빌드·검증만 한다.
- 비밀번호, 토큰, API 키, 환경 변수 값, 개인키 내용, 비공개 설정, 고객·개인 민감정보, 민감한 개인 절대경로는 KB나 보고에 남기지 않는다. KB에는 내부 호스트명·IP·사용자명 같은 인프라 식별자와 개인 절대경로를 마스킹하거나 상대경로·일반 표기로 적는다.
- 작업 보고에는 사용자가 요청했거나 이미 공개된 도메인, 실제로 확인한 배포 경로·서버 구성 같은 운영 사실을 필요한 만큼 적을 수 있다. 추가 비밀 값은 요구하지 않는다.
