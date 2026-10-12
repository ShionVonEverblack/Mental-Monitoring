## 2026-10-12T15:08:34Z

You are the Project Orchestrator (Phase 6) for RIMA (Ruang Interaksi Mental Aman).

Your Working Directory: C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\orchestrator_6
Project Root: C:\Users\Hype\Kuliah\Proyekan\mental monitoring
Original Request: Read C:\Users\Hype\Kuliah\Proyekan\mental monitoring\.agents\teamwork\ORIGINAL_REQUEST.md (entry dated 2026-10-12T15:06:58Z).

Your objective:
Ekstrak dan implementasikan secara komprehensif seluruh pustaka skill, playbook, dan arsitektur dari 7 repositori agent terkemuka (LibreChat, VoltAgent/awesome-agent-skills, mukul975/Anthropic-Cybersecurity-Skills, iOfficeAI/AionUi, alirezarezvani/claude-skills, liyupi/ai-guide, dan lsdefine/GenericAgent) ke dalam direktori masing-masing di `.agents/skills/` dan `.agents/rules/`, lengkap dengan panduan eksekusi mandiri, referensi, dan validasi 4 Quality Gates repositori RIMA.

Core Deliverables & Requirements:
1. Ekstraksi Pustaka Skill ke Direktori Masing-Masing (.agents/skills/):
   - `.agents/skills/librechat/`: Playbook conversational UI, dynamic artifacts rendering, integrasi MCP (Model Context Protocol), endpoint orchestration, multi-turn session persistence.
   - `.agents/skills/awesome-agent-skills/`: Kurasi katalog playbook produktivitas, software development, dan standar interoperabilitas lintas-harness (Antigravity, Claude Code, Cursor, Gemini CLI).
   - `.agents/skills/anthropic-cybersecurity-skills/`: Playbook komprehensif audit keamanan berbasis NIST CSF 2.0, NIST AI RMF, MITRE ATT&CK, proteksi kriptografi Web Crypto, sanitasi input/injeksi, dan audit privasi UU PDP No. 27/2022.
   - `.agents/skills/aion-ui/`: Playbook manajemen ruang kerja multi-agent, koordinasi subagent CLI lokal, pola automatisasi berkas.
   - `.agents/skills/claude-skills/`: Pustaka skill rekayasa perangkat lunak mandiri (zero external dependencies) untuk refactoring, audit kode, compliance, verifikasi modular.
   - `.agents/skills/ai-guide/`: Panduan operasional Vibe Coding, harness engineering, TDD-driven prompt development, gerbang verifikasi deterministik.
   - `.agents/skills/generic-agent/`: Mekanisme kristalisasi skill mandiri (self-evolving skill tree), pencatatan alur eksekusi sukses, teknik pemadatan densitas konteks (<30K tokens).
   Setiap skill wajib memiliki `SKILL.md` dengan YAML frontmatter valid (`name`, `description`), berstandar Google Antigravity / agentskills.io, lengkap dengan panduan eksekusi mandiri dan referensi.

2. Aturan Guardrails Sistem (.agents/rules/):
   - `.agents/rules/agent_skill_guardrails.md` terpasang dengan `trigger: always_on` untuk kepatuhan YAML frontmatter, pemadatan konteks (<30K tokens), dan penegakan offline-first, UU PDP No. 27/2022, kriptografi klien.

3. Preservasi Kualitas & 4 Quality Gates Repositori RIMA:
   - `npm run lint` (`oxlint`) = 0 error, 0 warning.
   - `npx tsc -b` = 0 error (exit code 0).
   - `npm test` (`vitest run`) = 100% lulus (65+ test files).
   - `npm run build` = produksi PWA & Service Worker bersih.
