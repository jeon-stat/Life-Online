# Open Stage Character Design

**Goal**

메인 화면의 캐릭터 연출을 카드형 미리보기에서 벗어나, 더 작은 3D 캐릭터가 열린 공간 안에 서 있는 구조로 바꾼다.

**Approved Direction**

- 캐릭터는 현재 대비 절반 크기로 축소한다.
- 캐릭터를 감싸는 카드 프레임은 제거한다.
- 화면 상단을 하나의 3D 공간처럼 사용한다.
- 파일을 `scene`, `models`, `ui` 단위로 분리해 다음 수정 속도를 올린다.

**Architecture**

- `src/scene/*`는 카메라, 조명, 애니메이션, 무대 설정만 담당한다.
- `src/models/*`는 전사, 마법사, 해적과 공통 바디 파츠를 담당한다.
- `src/ui/*`는 직업 탭과 스탯/액션 UI를 담당한다.
- `App.js`는 화면 조립만 담당한다.

**Verification**

- 테스트에서 `CHARACTER_SCALE === 0.5`와 `STAGE_LAYOUT.mode === "open-stage"`를 확인한다.
- `node --test`와 `expo export --platform web`를 다시 실행한다.
- 로컬 Expo 웹 미리보기에서 카드 없는 씬과 축소된 캐릭터를 확인한다.
