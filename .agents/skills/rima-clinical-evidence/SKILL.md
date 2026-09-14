---
name: rima-clinical-evidence
description: >-
  Guide and reference for implementing evidence-based psychological frameworks, screening tools,
  and clinical safety standards in RIMA. Use when creating or modifying clinical assessments
  (PHQ-9, GAD-7, DASS-21), Stanley-Brown Safety Plans, CBT journaling templates, grounding techniques,
  or ensuring compliance with APA App Advisor and NICE Evidence Standards Framework (ESF).
---

# RIMA Clinical Evidence & Psychological Frameworks

## 1. Core Clinical Mission & Scope of Practice

RIMA is an **evidence-based self-care and digital companion platform**, NOT a diagnostic medical device.
Every clinical feature must respect this boundary:
- **Never state or imply a formal diagnosis** (e.g., use "indikasi gejala kecemasan ringan" instead of "Anda menderita Generalized Anxiety Disorder").
- **Always provide context and educational framing**: Scores represent self-reported symptom severity over a defined period (e.g., past 2 weeks), not clinical prognosis.
- **Mandatory disclaimer**: Every assessment or clinical summary must render the `<ClinicalDisclaimer />` component or cite its standard disclaimer text.

---

## 2. Standardized Psychometric Instruments

When implementing or calibrating screening tools in RIMA, adhere to standardized scoring rubrics:

### A. PHQ-9 (Patient Health Questionnaire-9) — Depression
- **Timeframe**: Last 2 weeks
- **Scale**: 0 (Tidak pernah) to 3 (Hampir setiap hari) across 9 items (Total: 0–27)
- **Severity Cutoffs**:
  - `0–4`: Minimal / Tidak ada depresi
  - `5–9`: Gejala depresi ringan (Mild)
  - `10–14`: Gejala depresi sedang (Moderate)
  - `15–19`: Gejala depresi cukup berat (Moderately Severe)
  - `20–27`: Gejala depresi berat (Severe)
- **CRITICAL ITEM 9 SAFETY PROTOCOL**:
  - Item 9 asks: *"Pikiran bahwa Anda lebih baik mati, atau melukai diri sendiri"*
  - If Item 9 score $\ge 1$, trigger **immediate Level 3 escalation** regardless of total score.
  - Display the crisis intervention modal (`<CrisisInterceptor />`) and direct contact to 119 ext 8 / Into The Light.

### B. GAD-7 (Generalized Anxiety Disorder-7) — Anxiety
- **Timeframe**: Last 2 weeks
- **Scale**: 0 to 3 across 7 items (Total: 0–21)
- **Severity Cutoffs**:
  - `0–4`: Kecemasan minimal
  - `5–9`: Kecemasan ringan (Mild) — recommend breathing exercises & CBT
  - `10–14`: Kecemasan sedang (Moderate) — recommend safety plan & professional referral
  - `15–21`: Kecemasan berat (Severe) — prompt professional consultation

### C. DASS-21 (Depression Anxiety Stress Scales)
- 21 items with 3 subscales (7 items each: Depression, Anxiety, Stress).
- Scores are multiplied by 2 to compare with DASS-42 normative percentiles.

---

## 3. Stanley-Brown Safety Planning Intervention (SPI)

Located in `src/components/safety/SafetyPlan.tsx`. Must adhere strictly to the 6 hierarchical steps developed by Drs. Gregory K. Brown and Barbara Stanley:

1. **Step 1: Warning Signs (Tanda Peringatan)**
   - Thoughts, images, mood, behaviors indicating a crisis is developing (e.g., isolasi sosial, insomnia, pikiran negatif).
2. **Step 2: Internal Coping Strategies (Strategi Koping Mandiri)**
   - Activities done alone to take mind off problems (e.g., jalan kaki, mendengarkan instrumen, teknik pernapasan).
3. **Step 3: Social Contacts & Settings for Distraction (Orang & Tempat Pengalih Perhatian)**
   - Trusted friends, family, or public settings (e.g., kedai kopi, taman) that provide healthy distraction.
4. **Step 4: Individuals Who Can Offer Help (Orang yang Dapat Dimintai Bantuan)**
   - People the user can explicitly tell: *"Saya sedang dalam krisis dan butuh bantuanmu."*
5. **Step 5: Professionals and Agencies (Layanan Profesional & Darurat)**
   - Names and numbers of psychologists, hotlines (119 ext 8), hospital emergency departments.
6. **Step 6: Making the Environment Safe (Membuat Lingkungan Aman)**
   - Action steps to restrict access to lethal means (lethal means counseling principle).

*Rule: The Safety Plan must always be accessible offline in 1-tap from anywhere in the app.*

---

## 4. Somatic & Grounding Exercises

### A. Coherent Breathing (Resonance Frequency Breathing)
- **Protocol**: 6 seconds Inhale, 6 seconds Exhale (~5 breaths/minute).
- **Physiological Basis**: Maximizes Heart Rate Variability (HRV) and stimulates the vagus nerve (Polyvagal Theory, Porges), transitioning autonomic nervous system from sympathetic (fight-or-flight) to parasympathetic (rest-and-digest).
- **Implementation**: Haptic feedback (Web Vibration API, 70ms pulse) on transitions; gentle visual expansion/contraction.

### B. Box Breathing (Navy SEALs Protocol)
- **Protocol**: 4s Inhale – 4s Hold – 4s Exhale – 4s Hold. Useful for acute stress and panic de-escalation.

### C. 4-7-8 Breathing (Dr. Andrew Weil)
- **Protocol**: 4s Inhale – 7s Hold – 8s Exhale. Useful for sleep onset and severe agitation.

### D. 5-4-3-2-1 Sensory Grounding Technique
- Visual: 5 things you can see
- Tactile: 4 things you can physically feel
- Auditory: 3 things you can hear
- Olfactory: 2 things you can smell
- Gustatory/Affirmative: 1 thing you can taste or 1 positive truth about yourself.

---

## 5. APA App Advisor & NICE ESF Compliance Standards

Any code additions touching assessments, analytics, or clinical data must fulfill:

1. **APA Tier 1 (Privacy & Security)**:
   - Data stored client-side only (`localStorage`). Zero telemetry of health responses.
2. **APA Tier 2 (Clinical Foundation)**:
   - Feature must cite validated psychological research in code comments and in `RESEARCH_FOUNDATIONS.md`.
3. **APA Tier 3 (Usability)**:
   - Must be operable without specialized training. Reading level: Grade 8 Indonesian / English.
4. **APA Tier 4 (Therapeutic Integration)**:
   - Data must be exportable in formats clinicians can review (`exportMoodsAsCSV`, `exportJournalsAsCSV`, `generateClinicalSummaryHTML`).
5. **NICE ESF (Clinical Safety)**:
   - Escalation events (Level 2+) must maintain an immutable audit trail (`rima-escalation-log`, capped at 50 items) for clinical review.
