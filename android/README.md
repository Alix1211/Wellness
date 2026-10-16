# 가이아 웰니스 안드로이드 시험판 1016-O

- Android 8 이상. 가로 화면, 오프라인 실행. 진동은 이번 빌드에 넣지 않았습니다.
- 앱 안 설정 → 게임 저장 → 파일로 내보내기 / 파일 불러오기.
- 브라우저 저장은 브라우저에서 내보낸 JSON 파일을 앱에서 불러와 이전합니다.
- 웹과 앱이 자동으로 같은 저장을 공유하지는 않습니다.
- 설치 파일 서명·내장 HTML 일치·웹 게임 회귀 검증 완료. 실제 기기 설치/음악/멀티터치는 기기에서 확인해야 합니다.

## 재빌드
Android SDK platform 35, build-tools 35.0.0, Java 17, Eclipse ECJ 3.37.0이 필요합니다.
`ANDROID_SDK_ROOT/ecj.jar`에 ECJ jar를 놓습니다. ECJ는 Maven Central의 org.eclipse.jdt:ecj:3.37.0 입니다.

```sh
python3 tools/build_standalone.py gaia-wellness.html
ANDROID_SDK_ROOT=/path/to/android-sdk python3 tools/build_apk.py gaia-wellness.html GaiaWellness.apk
```

시험용 서명 키 `android/keys/gaia-test.jks`는 공개 저장소에 올리지 않습니다.
사용자에게 전달한 비공개 소스 백업 ZIP에 보관합니다. 키스토어/키 비밀번호는 시험용 기본값 `android`, 별칭은 `gaia-test`입니다.
같은 앱의 업데이트로 설치하려면 이 키와 패키지명 `city.gaia.wellness`를 계속 사용하고 versionCode를 올려야 합니다.
이 키를 잃으면 기존 앱 위에 업데이트할 수 없습니다. 새로 설치하기 전 저장 파일을 내보내세요.

## 저장/접근 범위
- 앱에 포함된 HTML만 HTTPS 모양의 내부 주소에서 로드하며 외부 탐색과 네트워크 요청은 차단합니다.
- 브리지는 저장 파일 입출력만 제공하며 안드로이드 문서 선택기로 선택한 파일만 읽고 씁니다.
- 파일 접근·전체 저장소·인터넷·진동 권한을 요청하지 않습니다.
- 불러오기는 내용 검증 후 확인 창을 거칩니다. 교체 직전 저장을 별도 키에 보관합니다.
