# 배포 런북

이 문서는 From Iron to Fame의 정적 빌드 산출물을 `fame.elcherlab.com`에 수동 배포하는 절차다. 자동 배포 스크립트나 CI 배포 job은 없다. **서버 쓰기, 설치, 서비스 재시작, Caddy reload, 배포는 작업 범위와 대상을 명시해 승인받는다.** 2026-11-16 초기 조사와 중단 세션 복구는 읽기 전용으로 수행했다. 이후 사용자가 로컬 테스트 통과를 조건으로 문서 갱신·dev/main 반영·커밋·원격 push·서버 배포를 승인했다. 이번 배포는 기존 Caddy 설정·루트·서비스를 유지하는 아래의 실제 디렉터리 교체 절차로 한정한다. 제안된 심볼릭 링크 레이아웃 이전과 공유 Caddy reload는 실행하지 않는다.

## 확인된 현재 상태

2026-11-16 읽기 전용 조사로 확인한 값이다. Caddy 파일의 행 번호와 실제 서비스 상태는 변경 직전에 다시 확인한다.

- 접속: `ssh oracle-elcherlab` (이 프로젝트 전용 별칭, 지식 저장소의 공통 규칙이 아님)
- 서버: Ubuntu 22.04.5
- 웹 서버: Caddy 한 인스턴스가 여러 호스트(관측 당시 12개)를 함께 서비스한다.
- 설정 파일: `/etc/caddy/Caddyfile`, `fame.elcherlab.com` 블록은 관측 당시 295–311행
- 문서 루트: `/home/ubuntu/from-iron-to-fame/dist`
- Caddy admin API의 설정 GET과 파일 내용이 일치했고, `https://fame.elcherlab.com/`는 HTTPS 200을 반환했다.
- 위 확인은 설정 일치와 도달성만 뜻한다. 실제 게임 플레이, 제공 자산 해시 일치, 다른 호스트의 상태를 함께 검증한 것은 아니다.
- 현재 문서 루트는 심볼릭 링크가 아닌 실제 디렉터리다. 아래 제안 레이아웃은 아직 생성하거나 적용하지 않았다.

## 빌드와 산출물

- 빌드와 검증은 로컬 또는 CI에서만 한다. 서버에 Node 빌드 환경을 설치하지 않는다.
- Node 22(CI 기준)에서 `npm ci` 후 `npm run check`를 실행한다. 2026-11-16 로컬 점검 환경은 Node 22.23.5였고 기본 Node는 24.19.0이었다. `check`는 `format:check → architecture:check → lint → typecheck → test → build` 전체다.
- 배포 산출물은 저장소의 `dist/` 내용이다. `dist/index.html`은 `/assets/...` 같은 루트 절대 경로를 참조하므로 반드시 `https://fame.elcherlab.com/` 루트에서 제공하고, 하위 경로 배포로 바꾸지 않는다.
- `check`의 build 단계는 작업 트리의 `dist/`를 다시 쓴다. 배포 기준은 같은 실행의 소스 커밋과 `dist/` 해시이며, 실행 뒤 변경 상태를 확인한다.
- 같은 origin을 유지한다. 저장 키 `iron-to-fame-save-v1`을 포함한 localStorage 데이터는 origin 기준이므로 도메인·스킴이 바뀌면 기존 저장과 분리된다.
- 2026-11-16 문서 정정과 LF 교정 후 Windows 10.0.26300 x64, Node 24.19.0, npm 11.15.0에서 `npm run check` 전체가 종료 코드 0으로 통과했다. 아키텍처 35모듈, 13개 파일 62개 테스트와 Vite 빌드를 포함한다. 이 단계에서는 Node 22 CI, 브라우저 플레이와 서버 배포를 검증하지 않았다. 이후 로컬 UI 스모크와 운영 비교 결과는 아래 기록을 따른다.
- CI는 검증과 빌드까지만 하고 산출물을 배포하지 않는다. 산출물 전송과 서버 반영은 사람이 승인 후 수행한다.

## 로컬 산출물과 원격 일치 조사

- 초기 산출물 조사 기준 커밋은 `0c13ec7`이다. Git 추적 중인 `dist/`는 `index.html`, CSS, JS 세 파일이며 마지막 변경은 `35b10a2`다. `35b10a2..0c13ec7` 사이에 `src`, `index.html`, `vite.config.ts`, `package.json`, lockfile 변경이 없음을 `git diff`로 확인했다. 이는 초기 조사 기록이며 당시에는 빌드를 실행하지 않았다. 아래 인덱스 해시는 이후 재빌드 산출물의 해시를 대신하지 않는다.
- 2026-11-16 초기 조사에서 저장소 인덱스의 LF 내용 기준 SHA-256은 다음과 같다. 당시 Windows 작업 트리는 CRLF여서 작업 트리 해시는 이 값과 달랐다. 이 값은 초기 인덱스의 스냅샷이며, 배포 시에는 실제 검증 실행으로 생성한 산출물의 해시를 새로 기록한다.
  - `dist/index.html`: `2bc8133791e22c42b84c24f9bcf1686f170e42a4457e39c9b271b992c7456295`
  - `dist/assets/index-BDauIeG5.css`: `e640d0f93ad2fa3267404f4a7ca43fa923c284087f83455b50a51d47911cac92`
  - `dist/assets/index-DO-tDXe0.js`: `1bd92addbae67115ef7f7b20aaa073024f86673bb967b43243e4390fbecc8fc4`
- `.prettierignore`에 `dist`가 포함되어 있어 `npm run format`은 `dist/`를 다시 쓰지 않는다. 따라서 포맷터만 적용한 작업 트리의 `dist/`는 CRLF로 남을 수 있다. 배포에는 같은 커밋에서 `npm run check`의 build 단계로 새로 만든 산출물을 사용하고 그 실행에서 나온 해시를 기록한다. 기존 추적 `dist/`를 그대로 올릴 때는 별도 승인 범위에서 EOL과 해시를 확인한다.
- 후속 배포 전 조사에서 로컬 재빌드 `index.html`·CSS·JS와 원격 실제 파일의 SHA-256 세 개가 모두 위 값과 일치했다. HTTPS 200이나 파일 해시는 실제 게임 플레이의 증거를 대신하지 않으므로 브라우저 스모크를 별도로 수행한다.
- 후속 읽기 전용 조사에서 원격 소스 체크아웃도 `0c13ec7b3fe774d4acd2e55818ac85a1d0df1513`이며 미커밋 변경이 없음을 확인했다. 이번 릴리스는 원격 소스를 승인된 main 커밋으로 fast-forward하고, 로컬에서 검증한 산출물을 별도로 전송한다. 서버에서 빌드하지 않는다.
- 승인된 읽기 전용 조사에서는 받은 응답을 먼저 파일로 저장한 뒤 로컬 산출물과 비교한다. 아래 명령의 `<asset>`은 응답의 `index.html`이 참조하는 실제 파일명으로 바꾼다.

```bash
curl -fsS https://fame.elcherlab.com/ -o /tmp/fame-index.html
sha256sum /tmp/fame-index.html dist/index.html
curl -fsS https://fame.elcherlab.com/assets/<asset> -o /tmp/fame-asset
sha256sum /tmp/fame-asset dist/assets/<asset>
```

- 해시가 다르면 오래된 배포, 캐시, 다른 체크아웃 중 무엇인지 단정하지 않는다. 응답 헤더와 시각, 커밋, 서버의 실제 파일 해시를 추가로 조사하고 사실만 기록한다.

## 로컬 UI 스모크와 이번 배포 방식 (2026-11-16)

- `npm exec --no -- vite preview --host 127.0.0.1 --port 4173 --strictPort`로 검증된 `dist/`를 제공하고 Ego Chromium에서 실제 UI를 조작했다. Node 24.19.0·npm 11.15.0·Windows 10.0.26300 x64 환경이다.
- 실제 데스크톱 뷰포트 1920×956, 모바일 에뮬레이션 390×844에서 홈과 기록 화면을 확인했다. 모바일 문서 폭은 390px로 가로 넘침이 없었다. 새 커리어 4단계, 시즌 진행과 결산 3단계, 새로고침 후 자동 저장 유지, JSON 백업·미리보기·적용, 저장 모달 Tab 순환·Escape·포커스 복귀가 동작했다.
- 합성 선수로 S12·2163 RP를 백업하고 S13까지 진행했다. 파일 미리보기는 현재 저장을 바꾸지 않았고, 적용 후 S12·2163 RP로 돌아왔으며 저장 객체 전체가 다운로드한 JSON과 deep equality로 일치했다. 기존 사용자 저장을 지우거나 덮어쓰지 않았다.
- 스모크 범위에서 배포 차단 오류는 발견하지 않았다. 실기기·스크린리더·전체 커리어와 기존 구현 격차의 해결을 주장하지 않는다. 기존 구현 격차는 [구현 로드맵](IMPLEMENTATION_PLAN.md)의 인벤토리를 따른다.
- 기존 루트 `/home/ubuntu/from-iron-to-fame/dist`를 유지한다. 서버의 `backups/<release-id>/`에 기존 dist 아카이브와 Caddyfile 사본·해시, 이전 소스 커밋을 보관한다. 다른 사이트 설정은 서버 밖으로 복사하지 않는다.
- 로컬에서 만든 산출물과 SHA-256 매니페스트를 전송해 `dist.next-<release-id>`에서 검증한다. 두 디렉터리가 같은 파일시스템이고 Caddy가 경로를 읽을 수 있는지 확인한다. 이전 index가 참조하는 해시 자산은 전환 후에도 유지한다.
- Linux `renameat2(RENAME_EXCHANGE)`로 검증된 스테이징과 실제 `dist`를 원자 교환한다. 이 API를 사용할 수 없으면 중단하며 비원자적 삭제·덮어쓰기로 대체하지 않는다. 교환 후 스테이징 경로에는 이전 dist가 남으므로 공개 URL·자산 해시·실제 UI 검증이 끝날 때까지 보존한다.
- 실패 시 같은 두 경로를 다시 원자 교환해 이전 dist를 복원한다. 소스 커밋은 배포 메타데이터로 기록하며, 롤백에서 작업 트리 reset이나 강제 push를 하지 않는다. 성공 후에도 백업과 이전 dist를 삭제하지 않는다.
- 이 방식은 Caddyfile 변경·validate·reload를 필요로 하지 않는다. 공유 설정 파일 해시·Caddy 활성 상태와 다른 호스트의 전후 응답을 비교하고, 운영 게임에서 새 커리어·시즌 진행·저장 유지를 별도로 확인한다. 아래 심볼릭 링크 이전 절차와 혼용하지 않는다.

## 제안 릴리스 레이아웃 (미생성)

```text
/home/ubuntu/deployments/from-iron-to-fame/
  releases/<release-id>/   # 릴리스마다 고정된 dist 내용
  current -> releases/<release-id>
  previous -> releases/<previous-id>
  backups/<release-id>/
```

- release-id는 UTC 시각과 커밋 짧은 SHA를 조합한다(예: `20261116T120000Z-0c13ec7`).
- `current` 심볼릭 링크와 릴리스 디렉터리는 같은 파일시스템에 두어 rename 기반 교체가 원자적이게 한다.
- 릴리스 디렉터리는 배포 후 수정하지 않는다. 변경은 새 release-id로 만든다.
- 기존 `/home/ubuntu/from-iron-to-fame/dist`는 이 계층 밖의 현재 경로이며, 이전 상태의 백업·롤백 대상으로만 남긴다.
- 아직 디렉터리를 만들지 않았고 Caddy 루트도 바꾸지 않았다.

## 1회 이전: 실제 디렉터리에서 릴리스 계층으로

현재 루트는 비어 있지 않은 실제 디렉터리이므로 `mv`로 심볼릭 링크를 그 위에 원자적으로 덮을 수 없다. 링크를 디렉터리 안으로 옮기거나 실패할 수 있으므로, 아래처럼 Caddy 루트를 새 `current`로 바꾸는 1회 이전을 별도 승인받아 수행한다.

1. 읽기 전용으로 현재 상태를 다시 확인한다. `readlink -f /home/ubuntu/from-iron-to-fame/dist`가 자기 자신을 가리키는지(아직 링크가 아닌지), Caddy 실행 사용자와 경로 탐색 권한(`ps`, `namei -l`), Caddyfile의 해당 블록과 행 번호, admin API의 적용 설정을 확인한다.
2. 기존 `dist`와 Caddyfile을 백업하고 무결성을 검증한다. Caddyfile에는 다른 사이트 설정이 있을 수 있으므로 서버 밖 저장소·KB·보고에 복사하지 않는다.

```bash
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 0750 "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP"
tar -C /home/ubuntu/from-iron-to-fame -czf "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/old-dist.tgz" dist
cp -a /etc/caddy/Caddyfile "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/Caddyfile"
tar -tzf "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/old-dist.tgz"
sha256sum "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/old-dist.tgz" "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/Caddyfile" > "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/SHA256SUMS"
sha256sum -c "/home/ubuntu/deployments/from-iron-to-fame/backups/$STAMP/SHA256SUMS"
```

3. 새 릴리스를 스테이징한다. 로컬 산출물에서 `dist` 루트 기준 상대 경로로 `SHA256SUMS`를 만들어 함께 전송하고, 서버에서는 받은 파일을 그 매니페스트로 검증한다. 매니페스트를 서버에서 다시 만들면 자기 검증이 되므로 사용하지 않는다.

```bash
REL="/home/ubuntu/deployments/from-iron-to-fame/releases/<release-id>"
install -d -m 0755 "$REL"
# 승인된 방법으로 dist 내용과 SHA256SUMS를 $REL로 전송한 뒤
cd "$REL"
sha256sum -c SHA256SUMS
test -s index.html
grep -oE '/assets/[^"]+' index.html
chmod -R a+rX "$REL"
namei -l "$REL/index.html"
```

4. `index.html`이 참조하는 모든 `/assets/...` 파일이 같은 릴리스에 있고 읽기 가능한지 확인한다. Caddy 실행 사용자가 상위 경로를 탐색할 수 없으면 200 대신 403/404가 날 수 있으므로 `namei -l`로 확인한다.
5. `current` 심볼릭 링크를 새 릴리스에 만들고 `readlink`로 값을 확인한다. 명령 예시는 `ln -s "releases/<release-id>" /home/ubuntu/deployments/from-iron-to-fame/current`다. 이 시점에는 Caddy 루트가 아직 기존 `dist`라서 공개 영향이 없다.
6. Caddyfile의 `fame.elcherlab.com` 블록에서 `root`만 `/home/ubuntu/deployments/from-iron-to-fame/current`로 바꾼다. 다른 호스트 블록, 도메인, TLS 설정은 바꾸지 않는다.
7. 변경 diff가 해당 블록 하나인지 확인하고 `sudo caddy validate --config /etc/caddy/Caddyfile`을 실행한다. 실제 reload 방법과 유닛 이름은 변경 전에 확인한다. 예시는 `sudo systemctl reload caddy`이며, 이 문서에서 유닛 이름을 확인한 것은 아니다.
8. reload 후 admin API의 설정 GET이 새 루트를 가리키는지, `fame.elcherlab.com`의 index와 자산이 200인지, 응답 해시가 새 릴리스와 같은지 확인한다.
9. reload는 공유 Caddy의 다른 호스트에도 영향을 준다. 변경 전에 다른 호스트의 기대 응답을 읽기 전용으로 기록하고, reload 후 같은 목록을 다시 확인한다. 호스트 목록은 Caddyfile에서 읽되 문서나 저장소에 비공개 호스트를 복제하지 않는다.
10. 검증·reload·smoke 중 하나라도 실패하면 백업한 Caddyfile을 그대로 복원하고 다시 validate·reload한 뒤 기존 `dist`가 서비스되는지 확인한다. 기존 디렉터리는 삭제하지 않았으므로 이것이 1회 이전의 롤백 경로다.
11. 성공 후에도 기존 `dist`와 백업은 승인 전까지 삭제하지 않는다.

## 일반 릴리스 (1회 이전 후)

1. 기준 커밋에서 `npm ci`와 `npm run check`가 실제로 통과한 출력을 기록하고, 같은 산출물로 `SHA256SUMS`를 만든다.
2. 새 릴리스 디렉터리에 산출물을 스테이징하고 `sha256sum -c`로 검증한다. `index.html` 존재, 참조 자산 존재, 파일 권한과 상위 경로 탐색 권한을 확인한다.
3. 교체 **전에** 현재 링크를 저장한다. 롤백은 교체 후 `current`를 다시 읽어 추정하지 않고 이 저장값을 사용한다.

```bash
install -d -m 0750 "/home/ubuntu/deployments/from-iron-to-fame/backups/<release-id>"
readlink /home/ubuntu/deployments/from-iron-to-fame/current > "/home/ubuntu/deployments/from-iron-to-fame/backups/<release-id>/previous-target"
test -s "/home/ubuntu/deployments/from-iron-to-fame/backups/<release-id>/previous-target"
```

4. 같은 파일시스템에서 임시 링크를 만든 뒤 rename으로 원자 교체한다. `ln -sfn`처럼 기존 링크를 먼저 지우는 방식은 원자적이지 않으므로 쓰지 않는다.

```bash
cd /home/ubuntu/deployments/from-iron-to-fame
ln -s "releases/<release-id>" current.tmp
mv -T current.tmp current
readlink current
```

5. 교체 후 index, 참조 자산, 해시, admin API 설정, 다른 호스트의 smoke를 확인하고 최소 1개의 실제 사용자 흐름(새 커리어 시작 또는 저장 생성·불러오기)을 사람이 확인한다.
6. 실패하면 저장해 둔 `previous-target`이 실제 존재하는지 확인한 뒤 같은 방식으로 링크를 되돌리고 smoke를 다시 수행한다. 원인을 해결하기 전 반복 교체하지 않는다.
7. 새 릴리스가 승인될 때까지 이전 릴리스와 백업을 유지한다. 오래된 릴리스 정리는 별도 승인 없이 자동화하지 않는다.

## 자산·캐시 연속성

- Vite의 해시 파일명은 immutable이지만, 이전 `index.html`을 캐시한 브라우저는 교체 후 이전 해시 자산을 요청할 수 있다. 새 릴리스에 그 파일이 없으면 새 문서를 받을 때까지 404가 날 수 있다.
- 로컬 `dist/`에는 service worker가 없고 파일이 세 개뿐임을 확인했다. 원격 `dist/`의 전체 파일 목록은 이번에 확인하지 않았다. 그래도 브라우저·프록시 캐시 정책은 확인하지 않았으므로 Caddy 응답 헤더를 배포 전에 읽어 실제 캐시 동작을 확인한다.
- 이전 해시 자산이 필요한 전환에서는 이전 릴리스에서 참조하던 자산을 새 릴리스에 유지하거나, 짧은 404 가능성을 운영상 수용한다고 명시적으로 기록한다. 조용히 이전 파일을 지우지 않는다.
- 향후 코드가 동적 import 등으로 이전 해시 자산을 필요로 하게 되면, 참조되는 파일을 새 릴리스에 포함하거나 수용 여부를 배포 기록에 남긴다.

## 백업과 롤백

- 1회 이전 전 백업은 실제 기존 `dist`와 정확한 Caddyfile 사본이며, 전환 전에 아카이브 목록과 SHA-256을 검증한다.
- 릴리스마다 로컬에서 만든 `SHA256SUMS`를 보관하고 서버에서 검증한다.
- 롤백 트리거: Caddy 설정 검증 실패, reload 실패, fame smoke 실패, 다른 호스트 회귀, 자산 404·해시 불일치가 수용 범위를 넘는 경우.
- 설정 문제는 백업한 Caddyfile을 복원하고 validate·reload 후 fame과 다른 호스트를 확인한다.
- 애플리케이션 문제는 교체 전에 저장한 `previous-target`으로 링크를 되돌리고 smoke를 다시 확인한다. 교체 후 `current`를 다시 읽어 이전 값을 추정하지 않는다.
- 1회 이전 단계에서 실패하면 새 `current` 대신 기존 `dist`를 가리키도록 Caddyfile을 복원한다.
- 롤백 후에는 원인, 영향 범위, 확인한 명령과 결과를 기록하고, 수정과 재배포를 다시 승인받는다.

## 승인과 안전 경계

- 읽기 전용 조사는 프로젝트 `AGENTS.md`의 SSH 조건을 따른다. 초기 조사에서는 `oracle-elcherlab`로 OS·Caddy·배포 경로·HTTPS 응답을 확인했고 중단 세션 복구는 이전 로그로 수행했다. 후속 요청에서 로컬 테스트를 조건으로 Git 반영과 서버 배포를 승인받았다. 이번 배포 범위는 게임 dist 백업·스테이징·원자 교체와 해당 소스 fast-forward이며 공유 설정 변경·설치·서비스 재시작·reload는 포함하지 않는다.
- 서버 파일 쓰기, 디렉터리 생성, 권한 변경, 패키지 설치, 서비스 재시작·reload, Caddy 설정 변경, 배포는 각각 명시적 승인이 필요하다. 백업 승인은 설정 변경 승인이 아니고, 설정 변경 승인은 배포 승인이 아니다.
- CI에는 배포 job, SSH 키, 배포 자격 증명을 두지 않는다. 산출물 전송과 서버 반영은 승인된 사람이 수행한다.
- 파괴적인 자동 배포 스크립트를 만들지 않는다. 이 문서의 명령은 예시이며 사람이 범위를 확인하고 실행한다.
- 비밀번호, 토큰, 키, 환경 변수 값, 개인키, 다른 사이트의 비공개 설정을 저장소·KB·보고에 남기지 않는다. Caddyfile 백업은 서버에만 둔다.
- 공유 Caddy 설정을 바꾸면 다른 호스트가 영향을 받을 수 있으므로, 검증과 reload, 다른 호스트 smoke를 생략하지 않는다.
- 이 런북은 상시 배포 권한을 부여하지 않는다. 예외적 수정도 범위를 정해 승인받으면 가능하며, 금지된 작업으로 일반화하지 않는다.

## 배포 전 체크리스트

- [ ] 기준 커밋과 실제 `npm run check` 통과 출력 기록
- [ ] 같은 커밋의 `dist/`와 로컬 `SHA256SUMS` 생성
- [ ] 기존 `dist`와 Caddyfile 백업, 아카이브 목록·SHA-256 검증
- [ ] 새 릴리스 스테이징, `sha256sum -c`, 파일 존재·권한·경로 탐색 확인
- [ ] 교체 전 `previous-target` 저장
- [ ] Caddyfile diff가 fame 블록의 루트로 한정됨, `caddy validate` 통과
- [ ] reload 승인과 다른 호스트 기대 상태 기록
- [ ] fame index·자산 200, 로컬 해시 일치, 실제 사용자 흐름 smoke
- [ ] 롤백에 사용할 저장값과 이전 릴리스 존재 확인
- [ ] 증거에 비밀 값이 없고, HTTP 200만으로 플레이를 주장하지 않음
