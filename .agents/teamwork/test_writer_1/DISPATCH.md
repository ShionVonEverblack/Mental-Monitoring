## 2026-10-10T06:56:40Z
You are Test Writer 1 (E2E Testing Track Writer).
Your working directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\test_writer_1
The project root directory is: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original request is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan is at: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\PROJECT.md

Exclusive file write ownership:
- TEST_INFRA.md (at project root)
- TEST_READY.md (at project root)
- src/test/phase2E2E.test.ts

Instructions:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and survey reports.
2. Create TEST_INFRA.md at C:\Users\Hype\Kuliah\Proyekan\mental monitoring\TEST_INFRA.md adhering to the 4-tier test architecture:
   - Tier 1: Feature Coverage (>=5 per feature)
   - Tier 2: Boundary & Corner Cases (>=5 per feature)
   - Tier 3: Cross-Feature Combinations (pairwise)
   - Tier 4: Real-World Application Scenarios
3. Implement `src/test/phase2E2E.test.ts` covering:
   - JITAI engine determinism, rule triggers (Red/Blue quadrant, mood drop velocity, sleep efficiency <85%, inactivity), and anti-habituation guardrails (quiet hours, cooldown, daily cap, daily dismiss state with rollover).
   - Fast-Action Safety Card crisis access, primary coping action, trusted contact dialing, 119 Ext 8 hotline link (`tel:119,8`), and somatic grounding route shortcuts.
   - Translation key parity across all 8 languages for Phase 2 copy.
4. Verify by running `npx vitest run src/test/phase2E2E.test.ts` once implementations are staged, or ensure mock/contract testing is solid.
5. Create TEST_READY.md at C:\Users\Hype\Kuliah\Proyekan\mental monitoring\TEST_READY.md when tests and runner specifications are published.
6. Write your handoff report in C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\test_writer_1\handoff.md.
7. Notify parent via send_message when complete.
