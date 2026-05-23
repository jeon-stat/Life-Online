# Open Stage Character Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카드 없는 열린 3D 공간으로 메인 캐릭터 연출을 바꾸고, scene/models/ui 파일 분할로 이후 수정 속도를 높인다.

**Architecture:** 씬 설정과 렌더링은 `src/scene`, 직업별 파츠는 `src/models`, 앱 표면 UI는 `src/ui`로 분리한다. `App.js`는 조립만 맡고, 테스트는 씬 설정 상수를 검증한다.

**Tech Stack:** Expo, React Native Web, @react-three/fiber, Node test runner

---

### Task 1: Add open-stage scene config

**Files:**
- Create: `src/scene/stageConfig.js`
- Modify: `test/game.test.mjs`

- [ ] Write failing test for `CHARACTER_SCALE` and `STAGE_LAYOUT`
- [ ] Run `node --test` and confirm missing module failure
- [ ] Add `CHARACTER_SCALE = 0.5` and `STAGE_LAYOUT = { mode: "open-stage", surface: "full-bleed" }`
- [ ] Run `node --test` again

### Task 2: Split 3D scene and model files

**Files:**
- Create: `src/scene/StageCanvas.web.js`
- Create: `src/scene/StageRig.js`
- Create: `src/scene/StageLights.js`
- Create: `src/models/shared/BodyBase.js`
- Create: `src/models/shared/FaceFeatures.js`
- Create: `src/models/shared/HairFront.js`
- Create: `src/models/WarriorModel.js`
- Create: `src/models/MageModel.js`
- Create: `src/models/PirateModel.js`
- Modify: `src/CharacterStage.web.js`

- [ ] Move camera and canvas setup into `StageCanvas.web.js`
- [ ] Move floating animation and global scale into `StageRig.js`
- [ ] Move lighting into `StageLights.js`
- [ ] Move shared body parts into `src/models/shared/*`
- [ ] Move each class mesh into its own file
- [ ] Keep `src/CharacterStage.web.js` as a thin router

### Task 3: Remove character card and make the top of the app a scene

**Files:**
- Create: `src/ui/ClassTabs.js`
- Create: `src/ui/StatRow.js`
- Create: `src/ui/ActionGrid.js`
- Modify: `App.js`

- [ ] Remove the old `characterCard` wrapper
- [ ] Create a full-width hero stage section
- [ ] Keep title and class text outside the 3D frame
- [ ] Keep stats and action buttons in slimmer lower sections

### Task 4: Verify and publish

**Files:**
- Modify: `package.json` if needed

- [ ] Run `node --test`
- [ ] Run `expo export --platform web`
- [ ] Run Expo web preview and visually verify the smaller open-stage character
- [ ] Commit and push to `main` for the shareable URL update
