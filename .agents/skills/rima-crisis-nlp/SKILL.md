---
name: rima-crisis-nlp
description: >-
  Guide for modifying, testing, and extending the RIMA crisis detection NLP engine.
  Use when the user asks to add new crisis keywords, improve detection accuracy,
  fix false positives/negatives, add language support, or tune scoring thresholds.
  Also use when debugging why a particular text triggers or doesn't trigger crisis detection.
---

# Crisis Detection NLP Engine

## Architecture Overview

The crisis detection pipeline has 3 phases:

```
User Text → [Phase 1: Co-occurrence] → [Phase 2: Keyword Tiers] → [Phase 3: Scoring] → CrisisDetectionResult
```

### Key File
`src/services/crisisDetectionService.ts`

### Detection Phases

1. **Co-occurrence Check** (highest specificity, score +100)
   - Matches `LETHAL_MEANS` + `TEMPORAL_INTENT` appearing together
   - Example: "ibuprofen" + "malam ini" → immediate severe
   - Based on Crisis Text Line research (Pisani et al., 2022)

2. **Keyword Tier Matching** (with negation filtering)
   - `severe` keywords: +10 each (suicidal ideation, explicit)
   - `moderate` keywords: +5 each (self-harm, hopelessness)
   - `mild` keywords: +2 each (distress, overwhelm)
   - Negation check: if keyword is preceded by negation prefix within 30 chars, skip it

3. **Score Thresholds**
   - `score >= 10` → severity: `severe`
   - `score >= 5`  → severity: `moderate`
   - `score >= 2`  → severity: `mild`

### Negation Handling

The `isNegated()` function checks 30 characters before the keyword for negation prefixes:
- ID: `tidak`, `gak`, `nggak`, `bukan`, `belum`, `jangan`
- EN: `not`, `don't`, `never`, `won't`, `no longer`
- JA: `ない`, `しない`
- ZH: `不想`, `没有`
- ES: `no`, `nunca`, `jamás`
- AR: `لا`, `ليس`, `لست`

### Supported Languages (8)
`id`, `en`, `jv`, `su`, `ja`, `zh`, `es`, `ar`

## How to Add New Keywords

1. Determine severity tier (severe/moderate/mild)
2. Add keyword to the appropriate array in `keywords` object
3. If adding a new language, add negation prefixes to `NEGATION_PREFIXES`
4. Run existing crisis detection tests: `npx vitest run src/services/__tests__/crisisDetection.test.ts`
5. Add new test cases for the keywords

## How to Add Co-occurrence Terms

1. Add means to `LETHAL_MEANS` array (medications, physical means)
2. Add temporal/intent markers to `TEMPORAL_INTENT` array
3. Co-occurrence auto-triggers severe (score +100)

## Consumer Services

| File | Usage |
|:---|:---|
| `forumService.ts` | `checkCrisisKeywords()` delegates to `detectCrisis()` |
| `escalationService.ts` | Evaluates latest journal + mood trends |
| `Forum.tsx` | Real-time typing detection + post interception |
| `Journal.tsx` | Post-save crisis modal |
| `Home.tsx` | EscalationBanner via journal content |

## Testing

```bash
npx vitest run src/services/__tests__/crisisDetection.test.ts
```

Always test:
- True positives (crisis text correctly detected)
- True negatives (safe text not flagged)
- Negation handling ("tidak ingin bunuh diri" should NOT trigger)
- Co-occurrence ("obat tidur" alone = no trigger, "obat tidur malam ini" = severe)
- Multilingual (test at least ID + EN + 1 other language)
