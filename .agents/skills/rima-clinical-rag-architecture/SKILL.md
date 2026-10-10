---
name: rima-clinical-rag-architecture
description: >-
  Comprehensive engineering blueprint and best-practice guide for implementing, evaluating,
  and maintaining an evidence-based Retrieval-Augmented Generation (RAG) system in RIMA.
  Covers hierarchical psychoeducational chunking, hybrid search (BM25 + dense embeddings),
  cross-encoder re-ranking, hallucination elimination prompts, Ragas evaluation, and offline-first
  privacy compliance under UU PDP No. 27/2022.
---

# RIMA Clinical RAG (Retrieval-Augmented Generation) Architecture

## 1. Executive Summary & Architectural Mission

In a mental health context, **hallucinations and ungrounded advice are unacceptable failure modes**. An AI chatbot providing fabricated psychological advice or inaccurate clinical assertions poses direct harm to vulnerable individuals.

The **RIMA Clinical RAG Architecture** enforces that conversational interactions are strictly grounded in curated, peer-reviewed psychoeducational literature, clinical screening standards (PHQ-9, GAD-7, C-SSRS), and official healthcare pathways (Indonesian BPJS Kesehatan & Puskesmas/FKTP protocols).

```
                      ┌───────────────────────────────────────┐
                      │              USER QUERY               │
                      └──────────────────┬────────────────────┘
                                         │
                         [Phase 0: Pre-Flight Crisis Triage]
                   (src/services/crisisDetectionService.ts)
                         │                          │
                 [Crisis Detected]           [Safe / Non-Crisis]
                         │                          │
                         ▼                          ▼
               ┌──────────────────┐       ┌───────────────────────────────────┐
               │ Immediate Bypass │       │  Hybrid Retrieval Pipeline (RAG)  │
               │ Crisis Modal     │       │  - Sparse: BM25 / MiniSearch      │
               │ (119 Ext 8 / SPI)│       │  - Dense: Multilingual Embeddings │
               └──────────────────┘       └─────────────────┬─────────────────┘
                                                            │
                                                [Reciprocal Rank Fusion]
                                                            │
                                                            ▼
                                              ┌───────────────────────────┐
                                              │   Contextual Re-Ranker    │
                                              │   (Cross-Encoder / Top-K) │
                                              └─────────────┬─────────────┘
                                                            │
                                                            ▼
                                              ┌───────────────────────────┐
                                              │ Grounded Generation Core  │
                                              │ - Strict Context Bound    │
                                              │ - CoT Self-Verification   │
                                              │ - Ref Citation Anchoring  │
                                              └─────────────┬─────────────┘
                                                            │
                                                            ▼
                                              ┌───────────────────────────┐
                                              │  Post-Generation Audit    │
                                              │  (Non-Diagnostic Gating)  │
                                              └─────────────┬─────────────┘
                                                            │
                                                            ▼
                                              ┌───────────────────────────┐
                                              │     VERIFIED RESPONSE     │
                                              └───────────────────────────┘
```

---

## 2. Psychoeducational Document Chunking Strategy

Standard fixed-length chunking (e.g., 500 characters arbitrary split) destroys clinical semantics, breaks grounding exercises, and severs warning signs from coping mechanisms. RIMA implements a **Hierarchical (Parent-Child) & Semantic Chunking Strategy**.

### A. Hierarchical Parent-Child Structure
1. **Parent Document (Module Level, 800–1,200 tokens):**
   - Represents the complete therapeutic intervention or educational article (e.g., *Understanding Panic Attacks & 5 Grounding Techniques*).
   - Contains overarching clinical context, contraindications, and disclaimers.
   - Sent to the generator LLM as context when one or more child chunks match.
2. **Child Chunks (Leaf Level, 150–250 tokens):**
   - Represents discrete, actionable concepts (e.g., *The 5-4-3-2-1 Sensory Grounding Technique*, *Symptoms of Hyperventilation*, *BPJS Step 1 at Puskesmas*).
   - Embedded into the vector index for high-precision retrieval matching.

### B. Metadata Schema for Clinical Chunks
Every chunk must carry structured metadata:

```typescript
export interface ClinicalChunk {
  id: string;                       // e.g., 'art-grounding-54321'
  parentId: string;                 // e.g., 'art-panic-management'
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'crisis' | 'referral';
  titleKey: string;                 // i18n title key
  content: string;                  // Markdown-formatted clinical content
  source: string;                   // e.g., 'APA & Kemenkes RI'
  evidenceLevel: 'guideline' | 'clinical_trial' | 'standard_practice';
  targetAudience: 'general' | 'adolescent' | 'caregiver';
  language: 'id' | 'en' | 'jv' | 'su' | 'ja' | 'zh' | 'es' | 'ar';
  readingGradeLevel: number;        // Flesch-Kincaid equivalent (< Grade 8)
  disclaimerRequired: boolean;
}
```

### C. Chunking Boundaries
- Chunks **must never split** across numbered therapeutic steps (e.g., Step 1 to 5 of TIPP or Stanley-Brown Safety Plan must reside within a single cohesive chunk).
- Headers (`#`, `##`, `###`) delineate semantic partitions.
- Minimum chunk size: 80 tokens (prevents low-information embeddings).
- Maximum chunk size: 300 tokens (prevents dilution in bi-encoder dot products).
- Overlap: 30 tokens between adjacent subsections for narrative continuity.

---

## 3. Hybrid Search (Sparse BM25 + Dense Semantic Vector Search)

Dense embeddings alone struggle with exact clinical acronyms, drug classes, or local bureaucratic terms (e.g., *PHQ-9*, *GAD-7*, *TIPP*, *Sp.KJ*, *FKTP*, *P-Care*, *BPJS*, *119 ext 8*). Sparse keyword matching (BM25) guarantees precision for these terms, while dense vector search captures semantic nuances (e.g., "dada sesak pengen nangis tanpa sebab").

### A. Dual Retrieval Setup
1. **Sparse Lexical Search (BM25 / MiniSearch):**
   - Tokenization: Multilingual tokenizer with Indonesian stemmer and stopword handling.
   - Boosts: Title fields ($\times 2.5$), clinical tags ($\times 2.0$), body content ($\times 1.0$).
2. **Dense Semantic Search (Bi-Encoder Embeddings):**
   - Model: Multilingual embedding model (e.g., `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` or `BAAI/bge-m3`).
   - Dimension: 384 or 1024 dims normalized with Cosine Similarity.

### B. Reciprocal Rank Fusion (RRF)
Merge the ranked lists from BM25 and Dense search using Reciprocal Rank Fusion with smoothing constant $k = 60$:

$$RRF\_Score(d) = \sum_{m \in \{dense, sparse\}} \frac{1}{k + rank_m(d)}$$

```typescript
export function reciprocalRankFusion(
  sparseResults: Array<{ id: string; rank: number }>,
  denseResults: Array<{ id: string; rank: number }>,
  k = 60,
  topN = 5
): Array<{ id: string; score: number }> {
  const scores = new Map<string, number>();

  for (const item of sparseResults) {
    const current = scores.get(item.id) || 0;
    scores.set(item.id, current + 1 / (k + item.rank));
  }

  for (const item of denseResults) {
    const current = scores.get(item.id) || 0;
    scores.set(item.id, current + 1 / (k + item.rank));
  }

  return Array.from(scores.entries())
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
```

---

## 4. Contextual Re-Ranking (Cross-Encoder)

Bi-encoders generate embeddings for query and document independently, missing complex cross-attention patterns. Passing the top 10–15 candidates from RRF through a lightweight Cross-Encoder (e.g., `bge-reranker-base` or `ms-marco-MiniLM-L-6-v2`) re-scores document relevance with direct token-to-token attention:

- **Re-ranking threshold:** Discard any retrieved chunk with a relevance score below $0.45$.
- **Redundancy deduplication:** If two chunks originate from the same Parent document, retain only the highest-scoring chunk to preserve context window diversity.
- **Final Context Window Budget:** Keep top 3–4 chunks (max 1,200 tokens total context).

---

## 5. Delusion Elimination & Grounding Prompt Engineering

To completely eliminate hallucinations and "sycophantic delusions", the system prompt enforces **strict context boundaries**, **source citation**, and an internal **Chain-of-Thought (CoT) self-audit**.

### A. Production System Prompt Template

```markdown
Anda adalah RIMA Assistant, asisten kesehatan mental psikoedukasi yang berempati, berbasis bukti ilmiah, dan patuh pada pedoman klinis (WHO Digital Health, APA, NICE ESF).

TUGAS ANDA:
Memberikan psikoedukasi, teknik stabilisasi mandiri (CBT, grounding, pernapasan), dan navigasi sistem kesehatan mental Indonesia (Puskesmas/BPJS) HANYA berdasarkan [KONTEKS] yang disediakan.

ATURAN MUTLAK (ZERO-TOLERANCE RULES):
1. BATAS KONTEKS KETAT: Jawab pertanyaan HANYA menggunakan fakta yang tertulis dalam [KONTEKS]. JANGAN PERNAH berasumsi, mengarang teori, atau mengutip informasi di luar [KONTEKS].
2. FALLBACK KETIDAKTAHUAN: Jika informasi tidak ditemukan dalam [KONTEKS], katakan dengan jujur dan sopan: "Maaf, saya tidak memiliki informasi klinis terverifikasi mengenai hal tersebut dalam basis pengetahuan RIMA. Untuk pertanyaan ini, saya menyarankan berkonsultasi langsung dengan psikolog klinis atau dokter di Puskesmas terdekat."
3. BUKAN ALAT DIAGNOSIS: JANGAN PERNAH memberikan diagnosis medis/psikiatri (misal: "Anda menderita depresi mayor/skizofrenia"). Gunakan frasa: "Berdasarkan gejala yang diceritakan, ini menunjukkan indikasi ketegangan emosional...".
4. DILARANG RESEP MEDIS: JANGAN PERNAH menyarankan obat resep (SSRI, benzodiazepin, dsb) atau dosis obat. Jelaskan bahwa pengobatan farmakologis hanya wewenang Dokter Spesialis Kedokteran Jiwa (Sp.KJ).
5. VALIDASI EMOSI, BUKAN DELUSI: Jika pengguna menyampaikan keyakinan paranoid/delusif (misal: "saya diawasi alien/tetangga"), validasi RASA TAKUT/CEMASNYA, tapi JANGAN PERNAH mengonfirmasi bahwa keyakinan delusif itu nyata. Arahkan ke teknik grounding fisik (5-4-3-2-1) dan bantuan profesional.
6. ATRIBUSI SUMBER: Selalu sebutkan sumber artikel atau panduan (contoh: [Ref: Panduan APA / Kemenkes RI]).

PROSES BERPIKIR INTERNAL (JALANKAN SEBELUM MENJAWAB):
1. Cek Krisis: Apakah pesan mengindikasikan bahaya melukai diri atau bunuh diri? (Jika ya, instruksikan segera akses SOS / 119 ext 8).
2. Verifikasi Batasan: Apakah user meminta diagnosis atau obat? (Jika ya, tolak dengan batas klinis).
3. Evaluasi Kesesuaian Konteks: Apakah potongan [KONTEKS] mencakup jawaban langsung?
4. Susun Respon: Nada hangat, empatik, berbasis fakta, dengan langkah konkret.
```

---

## 6. Continuous Evaluation Framework (Ragas Methodology)

RAG systems cannot be evaluated solely on human vibe checks. We use the **Ragas & TruLens Triad** quantitative evaluation framework:

| Metric | Target Score | Evaluation Definition & Formula | Mitigation if Failing |
| :--- | :--- | :--- | :--- |
| **Faithfulness (Groundedness)** | $\ge 0.95$ | $\frac{\text{Atomic claims inferred from Context}}{\text{Total atomic claims in Answer}}$. Measures zero hallucination. | Increase negative prompt constraints, lower temperature to 0.0, apply re-ranker cutoffs. |
| **Answer Relevance** | $\ge 0.88$ | Semantic cosine similarity between generated answer and user query intent. | Improve query expansion and remove extraneous retrieved context. |
| **Context Precision** | $\ge 0.90$ | Signal-to-noise ratio in retrieved chunks. Higher rank for relevant chunks. | Tune BM25 k1/b hyperparameters, add Cross-Encoder re-ranker. |
| **Context Recall** | $\ge 0.85$ | $\frac{\text{Ground truth claims in Context}}{\text{Total ground truth claims}}$. Measures retrieval completeness. | Adjust chunk sizes, decrease similarity cutoff, enrich psychoeducational markdown base. |

### Automated Evaluation Harness (CI/CD Pipeline)
- Build a synthetic golden dataset of 150 clinical question-answer pairs covering anxiety, depression, sleep, BPJS pathways, grounding, and adversarial inputs (jailbreaks, delusion reinforcement, medication requests).
- Run evaluation in CI test suites prior to merging knowledge base updates.

---

## 7. Deployment Feasibility for RIMA: Offline-First vs Privacy Edge

RIMA is strictly bound by **UU PDP No. 27/2022** and **100% Offline-First Architecture**.

### Architecture Option Matrix

| Dimension | Option A: 100% Client-Side In-Browser | Option B: Privacy-Preserving Edge Function | Option C (Recommended): Hybrid Tiered Architecture |
| :--- | :--- | :--- | :--- |
| **Vector Engine** | MiniSearch (BM25) + Voy / Orama in Wasm | Supabase `pgvector` with row-level encryption | In-browser MiniSearch (Offline) + Edge fallback (Online) |
| **Embeddings** | `Transformers.js` (WebGPU / WASM, ONNX INT8) | Server-side bi-encoder / OpenAI text-embedding-3 | Client-side MiniSearch pre-indexed (0MB download) |
| **Generation** | WebLLM (Qwen2.5-0.5B / SmolLM-360M) or Structured Template Match | Cloud LLM (Claude 3.5 Sonnet / GPT-4o-mini / Gemini 1.5) | Curated Structured Grounding (Offline) + Anonymized Edge LLM (Online) |
| **Offline Support** | 100% functional without internet | Requires active internet connection | 100% Core FAQs & Grounding work offline; Generative mode requires net |
| **Privacy / UU PDP** | 0 bytes leave user's device (Absolute compliance) | Zero-PII payload: scrubbed query + chunk only | Tier 0 & 1: 0 egress. Tier 2: scrubbed zero-PII |
| **Client Memory** | High if running WebLLM (300MB–1GB RAM) | Negligible (<5MB JS bundle) | Minimal (~80KB bundle via MiniSearch) |

### Recommended Implementation Roadmap (Option C: Hybrid Tiered)
1. **Tier 0 (Pre-Flight Filter):** `src/services/crisisDetectionService.ts` executes locally on 100% of user inputs. Crisis matches trigger `<CrisisInterceptor />` immediately with zero network latency.
2. **Tier 1 (Instant Local Grounding / Offline Engine):**
   - Pre-index all articles from `src/data/educationContent.ts`, `src/data/professionalServices.ts`, and `src/data/spiritualContent.ts` into a local `MiniSearch` instance.
   - Provides instant, zero-network, zero-download answers and grounding steps for common queries.
3. **Tier 2 (Privacy-Preserving Edge Augmentation - Optional):**
   - When user is online and requests open conversational exploration, transmit **ONLY** the query and retrieved psychoeducational chunk to an edge function.
   - Strip all session identifiers, names, mood entries, and device fingerprints.
   - Enforce temperature = 0.1 and strict system prompt grounding.

---

## 8. Verification & Auditing Checklist

Before deploying any RAG pipeline modification in RIMA, ensure:
- [ ] Pre-flight crisis filter intercepts C-SSRS Item 4/5 keywords before reaching the vector retriever.
- [ ] No personal mood entries, journal text, or user identifiers are indexed into shared vector stores.
- [ ] Model temperature is configured between `0.0` and `0.2`.
- [ ] Grounding disclaimer (`<ClinicalDisclaimer />`) is displayed alongside all generated outputs.
- [ ] Every recommended action links to an existing route in `App.tsx` (`/breathe`, `/grounding`, `/safety-plan`, `/tipp`, `/professional-help`).
- [ ] The pipeline passes automated Ragas Faithfulness tests ($\ge 0.95$).
