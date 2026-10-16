# 인수인계 (Claude ↔ GPT 공용) — 가이아 시티 웰니스 센터

> 새 대화를 시작하는 AI는 **이 파일부터 읽고**, `main` 최신에서 작업 가지를 새로 만든다. 작업이 끝나면 아래 "현재 상태"와 "작업 기록"을 고쳐 적는다.
> 케인(이관우)은 프로그래머가 아니다. 설명은 짧게, 결과물과 케인이 할 일만 쉽게 전달한다. 항상 존댓말, 한국어.

## 현재 상태
- 최신 작업: **1016-Q**(GPT), `1016-P` main에서 새 가지를 만들었습니다. P의 옥상 평균 판정·집 감소 7·미니게임 알림을 모두 유지했습니다.
- APK 서버 업데이트, SAF 드라이브 공유 JSON, 플레이 기록을 추가했습니다. 자세한 사용/구조는 `android/README.md`, 저장 불변 규칙은 `docs/standards/drive_save_sync.md`입니다. 사용자는 첫 파일 생성/연결을 직접 하기로 했습니다.
- 자동 빌드 **#5 성공**(2026-10-16). APK `GaiaWellness-1016-Q-original.apk`, versionCode **1100005**, v2/v3 서명 확인. 배포된 gzip SHA-256과 APK 내장 HTML 일치 확인.
- APK는 기존 GitHub Actions 자동 빌드·Secret 서명·증가 versionCode를 사용합니다. main 성공 빌드는 Release `wellness-live`에 APK와 게임 업데이트도 게시합니다. Secret이 없으면 새 키로 바꾸지 않고 중단합니다.
- Java 컴파일, baseT/JSON 단위 검사, 브리지 모의 브라우저 검사, 네임드/관리 회귀 통과. **실기기 설치·두 기기의 SAF/Drive 동기화는 아직 확인하지 않았습니다.**
- 앱의 네이티브 저장 기능은 새 APK 설치가 필요합니다. 이후 게임 수정은 main 자동 빌드 성공 후 다음 실행 때 가져옵니다. 회전 허용은 그대로이며 진동 권한은 추가하지 않았습니다.
- 1016-P 당시 확인: 자동 빌드 #2 성공, Secret 등록 완료. 실제 기기에서의 옥상 판정/미니게임 알림 확인은 보고되지 않았습니다.

## 협업 규칙
1. **기준은 `main` 하나.** 시작할 때 `git fetch` 후 `origin/main`에서 가지를 딴다. 옛 가지에서 계속하지 않는다(이번에 1015 가지에서 하다 어긋났다).
2. 큰 UI 개편(전체 화면 느낌·카메라·배경)은 GPT, 밸런스·버그·테스트는 Claude가 기본. 같은 파일을 동시에 크게 고치지 않는다.
3. 빌드 이름은 `빌드 10xx-X`를 설정 창 "버전" 줄(index.html의 `빌드 …`)에 적고 올릴 때마다 한 칸 올린다. 이 글자가 APK 이름·versionName에 쓰인다.
4. 작업이 끝나면 이 파일의 "현재 상태"를 고치고 `DESIGN.md`에 변경 이유를 적는다.
5. 커밋 꼬리말(Claude): `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` / `Claude-Session: …`.
6. 케인의 수정 요청은 모아서 한 번에 반영한다(하나 고치고 빌드 기다리는 반복 금지). 한도를 많이 쓸 작업은 먼저 말한다.

## APK 만들기 (자동)
- `.github/workflows/build-apk.yml`: `main`에 올라오면 자동으로, 또는 GitHub → Actions → "Build APK" → Run workflow(가지 선택 가능)로 수동 실행. 결과는 해당 실행 화면 맨 아래 Artifacts에서 받는다(`gaia-wellness.html`도 같이 들어 있다).
- versionCode는 `1100000 + 실행 번호`로 자동 증가(1016016보다 커서 기존 앱 위에 업데이트 설치됨). **이제부터 APK는 이 자동 빌드로만 만든다.** 손으로 만든 APK의 versionCode가 더 낮으면 설치가 막힌다.
- **서명 키**: 저장소 Secret `ANDROID_KEYSTORE_B64`(= `android/keys/gaia-test.jks`를 base64로 바꾼 글자). 키스토어·키 비밀번호 `android`, 별칭 `gaia-test`. 이 Secret이 없으면 새 키로 만들고 파일 이름에 `NEWKEY`가 붙는다 — 그 APK는 기존 앱 위에 설치되지 않는다(저장 파일을 먼저 내보낸 뒤 지우고 새로 설치).
- 키 파일은 git에 올리지 않는다(`.gitignore`). 키는 케인의 비공개 소스 백업 ZIP에 있다.
- 첫 실행은 성공했다. 실패하면 Actions 실행 화면의 빨간 ✗ 단계 로그(오류 줄)를 케인에게 받아 고친다. 러너는 `ubuntu-24.04`로 고정(`ubuntu-latest`가 2026-10-19에 바뀌는 것을 피함).
- 이 환경(Claude 세션)에서는 GitHub 로그를 볼 수 없고 Android SDK 다운로드도 막혀 있어, 워크플로를 로컬에서 시험할 수 없다. 수정은 케인이 로그를 붙여 주는 방식으로 한다.
- 케인이 하는 방법: Actions → Build APK → Run workflow, 끝난 실행 화면 위쪽 요약의 Artifacts 숫자(1)를 눌러 `GaiaWellness-<빌드>-original` 받기(이름에 `NEWKEY`가 있으면 키 Secret 문제).

## 알려진 사항
- `tools/test_minigames.cjs`, `tools/test_campaign.cjs`는 headless 환경에서 오류 9건으로 원래 실패한다(1016-O.1에서도 동일, 게임 로직과 무관 추정). 나머지 `test_management.cjs`, `test_named.cjs`는 통과. 실행: `MG_CHROME=/opt/pw-browsers/chromium node tools/<test>.cjs index.html`.
- 졸업 조건(집에서 모든 점수 ≥99.5)은 현재 구조에서 사실상 불가능 — 재설계 보류(권장: 졸업 평균 90 + 집 감소 완화).
- 회사·집은 건물 하나씩이고 칸 추가는 보내 줄 회원이 남아야 가능 — 새 수입원 테스트 후 조건 재검토(보류).
- 송사장 야근·하루 운영은 1016-K(`campaign.js`)에서 추가됨. 케인의 요청(저녁 개인면담=미니게임 랜덤 1종, 하루 2회+송사장 1회)과 실제로 맞는지는 아직 확인하지 않았다.

## 보류 목록 (케인이 말할 때만)
- 전체 UI 개편(앱→게임 화면), 배경 연출(시간대 하늘·시차 스크롤), 능력치를 올려 테두리 색을 보는 시험 버튼.

## 작업 기록
- 2026-10-16 Claude: 1016-P(옥상 판정·집 감소·미니게임 알림) 작성·`main` 합침, `HANDOFF.md`·자동 APK 빌드(`.github/workflows/build-apk.yml`, `tools/build_apk.py`의 javac 대체 경로와 `GAIA_KEYSTORE` 환경변수) 추가, 서명 키를 Secret으로 등록(케인).
- 2026-10-16 교훈: Claude가 1015 기준 옛 가지에서 작업해 GPT의 1016-I~O.1과 어긋났다. 작업 시작 전 항상 `git fetch` 후 `origin/main`에서 시작할 것.

- 2026-10-16 GPT: P 최신을 기준으로 Q 작성. ARPG 표준을 확인하고 서버 업데이트/오프라인 캐시, SAF 공유 저장, 충돌 선택 및 로컬 우선 보호, 저장에 포함되는 플레이 기록을 추가했습니다. 게임 규칙/대사/에셋은 바꾸지 않았습니다. 검사는 위 현재 상태 및 DESIGN/Android README에 기록했습니다.
