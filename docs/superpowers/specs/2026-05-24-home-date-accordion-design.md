# Home Date Accordion Design

**Goal**

공통 정보는 홈 탭으로만 모으고, 날짜를 누르면 홈 안에서 해당 날짜 정보가 펼쳐지도록 바꾼다. 캐릭터는 첫 진입 시 정면을 보게 맞춘다.

**Approved Direction**

- 하단 메뉴에 `홈`을 추가한다.
- `오늘 통계`, `날짜`, 캐릭터 히어로는 홈 탭에만 둔다.
- 홈의 날짜는 한 번에 하나만 펼쳐지는 아코디언으로 만든다.
- 캐릭터 초기 회전은 정면으로 보이게 수정한다.

**Architecture**

- `App.js`는 탭 구성과 화면 조립을 담당한다.
- `src/home/buildHomeDatePanels.js`는 홈 날짜 패널 데이터를 만든다.
- `src/ui/DateAccordion.js`는 홈 날짜 펼침 UI를 담당한다.
- `src/characters.js`는 GLB 캐릭터의 기본 정면 회전을 설정한다.

**Verification**

- 테스트에서 홈 날짜 패널이 오늘 데이터를 첫 항목으로 만든다는 것을 확인한다.
- 테스트에서 캐릭터 모델 기본 회전이 정면 기준으로 설정되었는지 확인한다.
- `node --test`, `expo export --platform web`, 브라우저 캡처로 홈 구조를 확인한다.
