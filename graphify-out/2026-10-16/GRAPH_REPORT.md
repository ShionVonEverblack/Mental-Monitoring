# Graph Report - mental monitoring  (2026-10-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 839 nodes · 2513 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78922c41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- phase2E2E.test.ts
- index.ts
- react
- Assessment.tsx
- Forum.tsx
- Profile.tsx
- BehavioralActivation.tsx
- vitest
- App.tsx
- clinicalRagService.ts
- exportImport.ts
- compilerOptions
- security.ts
- relapseStore.ts
- package.json
- compilerOptions
- SleepTracker.tsx
- dependencies
- devDependencies
- AudioSomaticsService
- generate_png_icons.cjs
- update_i18n.js
- updatePhase2Locales.cjs
- .oxlintrc.json
- scripts
- vite.config.ts
- capacitor.config.ts
- tsconfig.json
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `vitest` - 67 edges
2. `react` - 64 edges
3. `react-i18next` - 47 edges
4. `@testing-library/react` - 37 edges
5. `lucide-react` - 35 edges
6. `react-router-dom` - 34 edges
7. `Modal()` - 33 edges
8. `Button()` - 31 edges
9. `Profile()` - 25 edges
10. `App()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `MoodState` --references--> `MoodEntry`  [EXTRACTED]
  src/stores/moodStore.ts → src/types/index.ts
- `EscalationBannerProps` --references--> `MoodEntry`  [EXTRACTED]
  src/components/common/EscalationBanner.tsx → src/types/index.ts
- `JitaiNudgeCardProps` --references--> `JitaiNudge`  [EXTRACTED]
  src/components/common/JitaiNudgeCard.tsx → src/types/jitai.ts
- `RimaBackupData` --references--> `MoodEntry`  [EXTRACTED]
  src/utils/exportImport.ts → src/types/index.ts
- `CbtWizardProps` --references--> `CbtThoughtRecord`  [EXTRACTED]
  src/components/journal/CbtWizard.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (30 total, 6 thin omitted)

### Community 0 - "phase2E2E.test.ts"
Cohesion: 0.06
Nodes (65): i18next, mockLoginWithEmail, EscalationBannerProps, ICON_MAP, JitaiNudgeCardProps, FastActionSafetyCard(), FastActionSafetyCardProps, mockNavigate (+57 more)

### Community 1 - "index.ts"
Cohesion: 0.05
Nodes (62): CbtWizard(), CbtWizardProps, COMMON_EMOTIONS, GroupedMoodFactorSelector(), GroupedMoodFactorSelectorProps, MoodSelector(), MoodSelectorProps, MoodMeterCanvas() (+54 more)

### Community 2 - "react"
Cohesion: 0.06
Nodes (49): lucide-react, react, react-i18next, react-router-dom, AuthModal(), AuthModalProps, SelfCompassionModal(), SelfCompassionModalProps (+41 more)

### Community 3 - "Assessment.tsx"
Cohesion: 0.08
Nodes (49): ClinicalDisclaimer(), ClinicalDisclaimerProps, CrisisInterceptor(), CssrsWizardModal(), CssrsWizardModalProps, QuestionId, mockNavigate, PROFESSIONAL_SERVICES (+41 more)

### Community 4 - "Forum.tsx"
Cohesion: 0.09
Nodes (50): @supabase/supabase-js, AccountUser, INITIAL_ANON_USER, useAuth(), UseAuthReturn, Forum(), detectCrisis(), addCommentToPost() (+42 more)

### Community 5 - "Profile.tsx"
Cohesion: 0.09
Nodes (33): @testing-library/react, zustand, IncognitoPillToggle(), IncognitoPillToggleProps, mockToggleAnonymousMode, DualModePillToggle(), DualModePillToggleProps, useDualMode() (+25 more)

### Community 6 - "BehavioralActivation.tsx"
Cohesion: 0.09
Nodes (38): INITIAL_PLAN, PlanSection, renderIcon(), SafetyPlan(), SuggestionItem, Card(), Input, InputProps (+30 more)

### Community 7 - "vitest"
Cohesion: 0.10
Nodes (34): recharts, vitest, EscalationBanner(), JitaiNudgeCard(), MoodSelector(), useMood(), Analytics(), MOOD_COLORS (+26 more)

### Community 8 - "App.tsx"
Cohesion: 0.09
Nodes (29): react-dom, ActTherapy, Analytics, App(), AppShellLayout(), Assessment, BehavioralActivation, Breathe (+21 more)

### Community 9 - "clinicalRagService.ts"
Cohesion: 0.08
Nodes (30): EDUCATION_ARTICLES, EDUCATION_CATEGORIES, EducationArticle, SPIRITUAL_CONTENT, SPIRITUAL_SOURCES, SpiritualContent, ChatMessage, checkMedicalBoundary() (+22 more)

### Community 10 - "exportImport.ts"
Cohesion: 0.17
Nodes (25): ContactInfo, JournalEntry, SafetyPlan, downloadJSONFile(), escapeHTML(), exportAllDataAsJSON(), exportJournalsAsCSV(), exportMoodsAsCSV() (+17 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 12 - "security.ts"
Cohesion: 0.29
Nodes (16): AppLockScreen(), SetPinModal(), SetPinModalProps, bufToHex(), derivePbkdf2(), getLockoutStatus(), hashPin(), hashPinLegacy() (+8 more)

### Community 13 - "relapseStore.ts"
Cohesion: 0.19
Nodes (15): RelapsePrevention(), RelapseTab, DEFAULT_AVE_AFFIRMATIONS, DEFAULT_RELAPSE_PLAN, DEFAULT_STRATEGIES, DEFAULT_SUPPORT_CONTACTS, DEFAULT_WARNING_SIGNS, RelapseStoreState (+7 more)

### Community 14 - "package.json"
Cohesion: 0.12
Nodes (15): license, name, private, type, version, i18next-browser-languagedetector, jsdom, oxlint (+7 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "SleepTracker.tsx"
Cohesion: 0.38
Nodes (11): SLEEP_FACTOR_KEYS, SleepTracker(), calculateSleepMetrics(), calculateSleepStats(), calculateTimeInBedMinutes(), CBT_I_TIPS, deleteSleepEntry(), getSleepHistory() (+3 more)

### Community 17 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, i18next, i18next-browser-languagedetector, lucide-react, react, react-dom, react-i18next, react-router-dom (+5 more)

### Community 18 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, jsdom, oxlint, @testing-library/jest-dom, @testing-library/react, @types/node, @types/react, @types/react-dom (+4 more)

### Community 20 - "generate_png_icons.cjs"
Cohesion: 0.28
Nodes (7): crc32(), createRimaPng(), fs, iconsDir, makeChunk(), path, zlib

### Community 21 - "update_i18n.js"
Cohesion: 0.29
Nodes (4): enKeys, fs, idKeys, path

### Community 22 - "updatePhase2Locales.cjs"
Cohesion: 0.29
Nodes (6): deepMerge(), fs, i18nDir, languages, path, translations

### Community 23 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 24 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

## Knowledge Gaps
- **8 isolated node(s):** `jsdom`, `oxlint`, `@types/node`, `@types/react`, `@types/react-dom` (+3 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 256 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `phase2E2E.test.ts`, `index.ts`, `react`, `Assessment.tsx`, `Forum.tsx`, `Profile.tsx`, `BehavioralActivation.tsx`, `App.tsx`, `clinicalRagService.ts`, `exportImport.ts`, `security.ts`, `relapseStore.ts`, `package.json`, `SleepTracker.tsx`, `vite.config.ts`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **What connects `jsdom`, `oxlint`, `@types/node` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `phase2E2E.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057345360824742266 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `phase2E2E.test.ts`, `index.ts`, `Assessment.tsx`, `Forum.tsx`, `Profile.tsx`, `BehavioralActivation.tsx`, `vitest`, `App.tsx`, `clinicalRagService.ts`, `security.ts`, `relapseStore.ts`, `package.json`, `SleepTracker.tsx`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051490514905149054 - nodes in this community are weakly interconnected._
- **Why does `react-i18next` connect `react` to `phase2E2E.test.ts`, `index.ts`, `Assessment.tsx`, `Forum.tsx`, `Profile.tsx`, `BehavioralActivation.tsx`, `vitest`, `App.tsx`, `clinicalRagService.ts`, `security.ts`, `relapseStore.ts`, `package.json`, `SleepTracker.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.061708860759493674 - nodes in this community are weakly interconnected._