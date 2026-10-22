# 광물에서 명전까지

이터널 리턴 소재의 한국어 싱글플레이 선수 육성 시뮬레이션입니다.

## 실행

```bash
npm install
npm run dev
```

검증: `npm run check` (포맷 → 린트 → 타입 검사 → 테스트 → 배포 빌드)

현재 구현: 단계별 선수 생성, 12주 시즌, 랭크·RP, 패치 메타와 실험체 풀, 48팀 마스터즈·LCQ·시즌 파이널, KEL, 계약·이적·로스터 운영, 통산 기록·수상·은퇴·명예의 전당, 버전형 브라우저 자동 저장, 미리보기 기반 JSON 백업·복원과 시드 기반 시뮬레이션 검증.

현재 구조 개선 단계에서는 생성·시즌·팀·대회·보조 화면, 저장 수명주기, 전역 토스트, UI 공통 상수, 랭크·커리어 기록과 참가 정책을 앱·엔진 진입점에서 분리했다. 저장 모달은 포커스 순환·복귀와 배경 스크롤 차단을 지원하며, 주요 표는 모바일 카드로 전환된다. ESLint·Prettier와 GitHub Actions가 `main` 및 pull request의 코드 형식, 정적 검사, 타입, 단위·UI 테스트와 빌드를 자동 검증한다.

## 문서

- [게임 시스템 설계](docs/GAME_DESIGN.md)
- [구현 로드맵](docs/IMPLEMENTATION_PLAN.md)
- [코드 구조와 개발 원칙](docs/ARCHITECTURE.md)
- [UI/UX 개선 계획](docs/UI_UX_PLAN.md)
- [KEL·마스터즈 대회 구조와 규칙](docs/ESPORTS_RULES.md)
- [랭크·시즌·커리어 시스템](docs/RANK_AND_CAREER_SYSTEMS.md)
- [공식 자료 출처와 적용 원칙](docs/DATA_SOURCES.md)
