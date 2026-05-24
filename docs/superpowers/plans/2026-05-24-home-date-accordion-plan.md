# Home Date Accordion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 탭에 공통 정보를 모으고, 날짜별 내용을 펼쳐보는 아코디언과 정면 캐릭터를 구현한다.

**Architecture:** 홈 날짜 데이터는 별도 빌더 함수에서 만들고, UI는 아코디언 컴포넌트로 분리한다. 탭 구조는 `App.js`에서 정리하고, GLB 캐릭터의 기본 회전은 캐릭터 설정에서 맞춘다.

**Tech Stack:** Expo, React Native Web, Node test runner

---

### Task 1: Add failing tests for home date panels and character facing

**Files:**
- Modify: `test/game.test.mjs`

- [ ] Add test for `buildHomeDatePanels`
- [ ] Add test for front-facing GLB rotation
- [ ] Run `node --test` and confirm failure

### Task 2: Build home date panel data and accordion UI

**Files:**
- Create: `src/home/buildHomeDatePanels.js`
- Create: `src/ui/DateAccordion.js`

- [ ] Build panel data with today first and sample recent dates below
- [ ] Render one-open-at-a-time accordion UI

### Task 3: Reorganize tabs and move shared content into Home

**Files:**
- Modify: `App.js`
- Modify: `src/ui/BottomTabs.js`

- [ ] Add `홈` tab
- [ ] Move hero, stats, and date UI into Home only
- [ ] Remove duplicate common sections from other tabs

### Task 4: Fix initial character facing and verify

**Files:**
- Modify: `src/characters.js`

- [ ] Set GLB model default rotation to face front
- [ ] Run tests, export web build, and verify in browser
