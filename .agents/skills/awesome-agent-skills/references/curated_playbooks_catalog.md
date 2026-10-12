# Curated Production Agent Playbooks Catalog

Derived from the `VoltAgent/awesome-agent-skills` ecosystem (1,000+ vetted community and enterprise skills), this catalog provides an indexed reference of 36 production-grade agent playbooks categorized across 6 core engineering domains.

---

## Domain 1: Software Engineering & Architecture

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 1 | `clean-architecture-scaffold` | Structuring new modules or establishing layered domain boundaries. | Generates clean separation: domain entities, use-case interactors, repositories, and presentation adapters. | File structure audit & boundary check |
| 2 | `ast-code-refactor` | Refactoring complex functions or decomposing God components. | Zero-dependency AST-driven refactoring script decomposing monolithic functions into pure subroutines. | Linter & unit test pass |
| 3 | `design-tokens-enforcer` | Auditing or authoring styles to ensure design tokens compliance. | Scans stylesheets for hardcoded hex colors, arbitrary margins, or forbidden utility CSS classes (Tailwind). | Regex token scan script |
| 4 | `api-contract-designer` | Authoring REST, SSE, or WebSocket API specifications. | Generates OpenAPI 3.1 or JSON Schema contract with strict request/response parameter validation. | Schema validation test |
| 5 | `zero-dep-refactor-toolkit` | Replacing bloated third-party dependencies with native standard libraries. | Migrates lodash/moment/axios calls to modern ECMAScript standard primitives (`Array`, `Intl`, `fetch`). | Lockfile & bundle size comparison |
| 6 | `component-decomposition-guide` | Component exceeds 250 lines or mixes layout with business logic. | Decomposes React component into presentational UI, custom data hooks, and styling token files. | Line count & unit test verification |

---

## Domain 2: Quality Assurance & Automated Testing

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 7 | `tdd-red-green-refactor` | Implementing new features or bug fixes via Test-Driven Development. | Enforces strict cycle: write failing test first, minimal functional code to pass, clean refactoring. | Vitest watch execution trace |
| 8 | `vitest-suite-builder` | Creating unit or integration tests for React 19 / TypeScript apps. | Generates isolated test suites with render hooks, mock resets, and async assertion helpers. | `npm test` exit code 0 |
| 9 | `mutation-testing-runner` | Evaluating test suite resilience and catching false-positive tests. | Injects mutations into conditionals/operators and verifies test suite fails on mutants. | Mutation score threshold $\ge 80\%$ |
| 10 | `deterministic-gate-checker` | Executing pre-commit or pre-merge repository verification gates. | Executes 4-tier verification (linter, composite compiler, test suite, build) requiring exit code 0. | Automated runner exit code 0 |
| 11 | `mock-service-virtualizer` | Testing components dependent on flaky or external network APIs. | Virtualizes HTTP/SSE endpoints with in-memory deterministic fixtures without network calls. | Air-gapped test execution |
| 12 | `test-coverage-governor` | Auditing repository line, branch, and function test coverage. | Computes Istanbul/c8 coverage reports and blocks code changes dropping coverage below threshold. | Coverage report inspection |

---

## Domain 3: Security, Cryptography & Privacy

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 13 | `web-crypto-vault` | Storing or transmitting sensitive user data (journals, safety plans). | AES-GCM-256 + PBKDF2 (600,000 iterations) zero-knowledge client-side encryption vault. | Cryptographic unit tests |
| 14 | `owasp-injection-defense` | Handling user inputs, dynamic DOM rendering, or LLM output display. | Strict DOMPurify sanitization, XML boundary wrapping, and prompt injection taint-tracking. | Security unit test suite |
| 15 | `uu-pdp-privacy-audit` | Auditing compliance with Indonesian UU PDP No. 27/2022. | Verifies explicit consent capture, right to erasure wipe, 72h breach protocol, and zero PII collection. | Statutory compliance checklist |
| 16 | `dependency-vuln-scanner` | Inspecting third-party package dependencies for CVE vulnerabilities. | Zero-network local `npm audit` / lockfile scanner identifying vulnerable transitives. | Audit report verification |
| 17 | `secret-leak-sanitizer` | Reviewing code changes prior to git commit or release. | Scans staged git diffs for API keys, bearer tokens, private keys, or credentials. | Regex entropy secret scanner |
| 18 | `csp-header-hardening` | Configuring Content Security Policy headers for web apps and iframes. | Generates restrictive CSP headers prohibiting external script injection and unauthorized frames. | Security header lint check |

---

## Domain 4: DevOps, CI/CD & Performance

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 19 | `rollup-chunk-partitioner` | Optimizing PWA production build bundles and code-splitting. | Vite/Rollup manual chunk configuration isolating translation catalogs and third-party vendor libs. | `npm run build` chunk inspection |
| 20 | `workbox-pwa-cache-architect` | Configuring offline service worker precaching and runtime tiers. | Implements Workbox cache tiers (`CacheFirst` for static assets, `NetworkOnly` for API sync). | PWA offline audit in Lighthouse |
| 21 | `spa-rewrite-deployment` | Deploying single-page applications to static hosts (Vercel/Netlify). | Validates `vercel.json` and `netlify.toml` routing fallback rewrites to `/index.html`. | Deep-link routing test |
| 22 | `docker-container-hardening` | Packaging container images with minimal attack surfaces. | Multi-stage Dockerfile, unprivileged non-root user execution, and read-only root filesystems. | Container security scan |
| 23 | `bundle-size-budget-guard` | Checking pull request bundle impact against size budgets. | Measures asset byte sizes against strict budget thresholds (e.g. main bundle $< 250\text{ KiB}$). | Build stats size comparison |
| 24 | `lighthouse-pwa-optimizer` | Auditing Progressive Web App metrics on mobile viewports. | Audits Core Web Vitals (LCP, FID/INP, CLS) and verifies offline precache resilience. | Lighthouse PWA audit score $\ge 90$ |

---

## Domain 5: Multi-Agent Coordination & Workflow

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 25 | `git-worktree-isolator` | Running parallel subagents without working tree file collision. | Provisions isolated Git worktrees with detached HEADs and cleans up workspaces upon task finish. | Git worktree status check |
| 26 | `acp-process-watchdog` | Managing local CLI subagent processes (Claude Code, helper scripts). | Subprocess monitor with timeout watchdog, graceful SIGINT fallback, and process tree cleanup. | Process exit code check |
| 27 | `atomic-file-mutator` | Updating critical codebase files without risking partial corruption. | Write-to-temporary file then atomic rename pattern with automated `.bak` snapshot backups. | File integrity & backup check |
| 28 | `multi-persona-reviewer` | Performing multi-perspective code review prior to merge. | 3-Persona review protocol: The Saboteur (edge cases), The New Hire (readability), The Auditor (security). | Review matrix evaluation |
| 29 | `execution-trace-logger` | Recording multi-step agent actions for debugging or crystallization. | Formats structured JSON-lines traces tracking tools invoked, inputs, outputs, and obstacles. | Trace log schema validation |
| 30 | `hierarchical-memory-manager` | Managing agent context across long tasks to prevent context exhaustion. | 4-Tier memory tiering: L1 Scratchpad, L2 Session Briefing, L3 Domain Skills, L4 Archive. | Context token measurement |

---

## Domain 6: Documentation, i18n & Accessibility

| # | Playbook Name | Trigger Criterion ("Use when...") | Operational Deliverable / SOP | Verification Method |
|---|:---|:---|:---|:---|
| 31 | `i18n-parity-harmonizer` | Adding or updating user-facing copy across multiple languages. | 8-Language dictionary synchronizer ensuring 100% key parity, zero empty strings, and RTL support. | `npx vitest run src/test/i18nParity.test.ts` |
| 32 | `wcag-accessibility-auditor` | Auditing UI components for accessibility compliance. | Validates contrast ratio $\ge 4.5:1$, touch target $\ge 48\text{px}$, ARIA labels, and calm modes. | Axe / a11y automated tests |
| 33 | `living-adr-documenter` | Documenting architectural decisions and structural tradeoffs. | Formats Architecture Decision Records (ADRs) with Context, Options, Decision, and Consequences. | ADR file schema validation |
| 34 | `rtl-layout-validator` | Reviewing bidirectional layout rendering (Arabic / Hebrew). | Validates `dir="rtl"`, mirrored icons, logical margin/padding CSS properties (`margin-inline-start`). | Bidirectional layout render test |
| 35 | `trauma-informed-ui-inspector` | Inspecting psychiatric and mental health user interfaces. | Flags high-speed animations ($>2\text{Hz}$), red emergency banners, and high-stimulation elements. | Sensory mode CSS inspection |
| 36 | `automated-changelog-generator` | Generating release notes from structured conventional commits. | Parses conventional commit tags (`feat`, `fix`, `perf`) into categorized Markdown changelogs. | Markdown output validation |

---

## Operational Execution Standard

When invoking any playbook from this catalog:
1. Locate the playbook by matching the user's intent to the **Trigger Criterion**.
2. Inspect the **Operational Deliverable / SOP** to guide task decomposition.
3. Validate output against the specified **Verification Method**.
4. Confirm zero regressions across RIMA's 4 Quality Gates.
