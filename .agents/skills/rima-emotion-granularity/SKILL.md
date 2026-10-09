---
name: rima-emotion-granularity
description: >-
  Architectural and psychological guide for implementing 2D Valence-Arousal Mood Meters,
  Russell's Circumplex Model of Affect, Yale RULER emotion grids, and localized 64-word
  affective taxonomies in RIMA. Use when designing multi-dimensional mood pickers,
  visualizing valence-arousal trends, or expanding emotional vocabulary across 8 languages.
---

# RIMA Emotion Granularity & 2D Mood Meter Architecture

## 1. Clinical & Neuroscientific Foundations

### Why Emotion Granularity Matters
Traditional mood trackers use simple 1-dimensional scales (e.g., 1–5 stars or sad-to-happy emojis). Neuroscientific research by Dr. Lisa Feldman Barrett (*How Emotions Are Made*) and Dr. Marc Brackett (*Permission to Feel*, Yale Center for Emotional Intelligence) demonstrates:
- **Low Granularity Trap**: Experiencing affect as merely "feeling bad" triggers generalized rumination and helplessness.
- **High Granularity Advantage**: Disentangling whether one feels *exhausted* (low arousal, physical), *anxious* (high arousal, threat perception), *disappointed* (low arousal, expectation breach), or *enraged* (high arousal, boundary violation) leads to $35\text{--}50\%$ more effective targeted emotion regulation.
- **Russell's Circumplex Model (1980)**: Emotional states arise from neurophysiological core affect organized along two orthogonal dimensions:
  1. **Valence** ($X \in [-1.0, +1.0]$): From extremely unpleasant/negative to extremely pleasant/positive.
  2. **Arousal / Energy** ($Y \in [-1.0, +1.0]$): From deep physiological deactivation/calm to high autonomic sympathetic activation.

---

## 2. The 4 Quadrants Matrix

```
       Arousal (Tingkat Energi / Aktivasi Fisik)
                      ▲ +1.0 (Tinggi)
                      │
   [MERAH: Energi Tinggi, Valensi Rendah]   │   [KUNING: Energi Tinggi, Valensi Tinggi]
   • Panik, Cemas, Marah, Frustrasi         │   • Gembira, Semangat, Bangga, Terinspirasi
   • Strategi: DBT TIPP, Cyclic Sighing     │   • Strategi: Savouring, Ekspresi Kreatif
                      │
-1.0 (Negatif) ────────┼────────────────────────► +1.0 (Positif) Valence (Kenyamanan Rasa)
                      │
   [BIRU: Energi Rendah, Valensi Rendah]    │   [HIJAU: Energi Rendah, Valensi Tinggi]
   • Sedih, Lelah, Hampa, Putus Asa         │   • Tenang, Damai, Syukur, Rileks
   • Strategi: Behavioral Activation (BA)   │   • Strategi: Grounding, Mindful Reflection
                      │
                      ▼ -1.0 (Rendah)
```

---

## 3. Data Structures & TypeScript Schema

```typescript
export type EmotionQuadrant = 'red' | 'yellow' | 'blue' | 'green';

export interface EmotionDescriptor {
  id: string;
  quadrant: EmotionQuadrant;
  valence: number; // -1.0 to +1.0
  arousal: number; // -1.0 to +1.0
  translationKey: string;
  recommendedIntervention: 'tipp' | 'breathe' | 'grounding' | 'activation' | 'journal';
}

export interface MoodMeterEntry {
  id: string;
  timestamp: string;
  valence: number;   // -1.0 to 1.0
  arousal: number;   // -1.0 to 1.0
  quadrant: EmotionQuadrant;
  selectedEmotions: string[]; // EmotionDescriptor IDs
  intensity: number; // 1 to 5
  note?: string;
}
```

---

## 4. Multilingual Emotion Taxonomy (64-Item Localized Map)

When populating emotion words, maintain strict translation parity across all 8 supported languages:

| Quadrant | Emotion ID | Bahasa Indonesia (`id`) | English (`en`) | Basa Jawa (`jv`) | Basa Sunda (`su`) | 日本語 (`ja`) | 简体中文 (`zh`) | Español (`es`) | العربية (`ar`) |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Red** | `anxious` | Cemas | Anxious | Kuwatir | Salempang | 不安な | 焦虑 | Ansioso/a | قلق |
| **Red** | `panicked` | Panik | Panicked | Gugup Bingung | Geumpeur | パニック | 恐慌 | Con pánico | مذعور |
| **Red** | `frustrated`| Frustrasi | Frustrated | Bosen Nelangsa | Kesel Pisan | もどかしい | 挫败 | Frustrado/a | محبط |
| **Red** | `overwhelmed`| Kewalahan | Overwhelmed | Kabotan | Teu Kadada | 圧迫感がある | 不堪重负 | Abrumado/a | منهك بالضغوط |
| **Yellow**| `joyful` | Gembira | Joyful | Bungah | Bingah | 喜びに満ちた | 喜悦 | Alegre | مفعم بالفرح |
| **Yellow**| `inspired` | Terinspirasi | Inspired | Kagugah | Kaidean | 意欲が湧く | 备受鼓舞 | Inspirado/a | ملهم |
| **Yellow**| `proud` | Bangga | Proud | Bombong | Reueus | 誇らしい | 自豪 | Orgulloso/a | فخور |
| **Yellow**| `hopeful` | Penuh Harapan| Hopeful | Pangajap-ajap | Pinuh Harepan | 希望に満ちた | 充满希望 | Esperanzado/a | مفعم بالأمل |
| **Blue** | `sad` | Sedih | Sad | Sedhih | Sedih | 悲しい | 悲伤 | Triste | حزين |
| **Blue** | `exhausted`| Lelah Habis | Exhausted | Sayah Sanget | Lungse Pisan | 疲れ果てた | 精疲力竭 | Agotado/a | مرهق تماماً |
| **Blue** | `numb` | Hampa / Mati Rasa | Numb | Matheng | Baal / Hapa | 感情が麻痺した | 麻木 | Insensible / Vacío | خدر المشاعر |
| **Blue** | `lonely` | Kesepian | Lonely | Ijenan | Nyorangan | 孤独な | 孤独 | Solitario/a | وحيد |
| **Green**| `calm` | Tenang | Calm | Ayem | Tiis Ceuli | 穏やかな | 平静 | Calmado/a | هادئ |
| **Green**| `grateful` | Penuh Syukur | Grateful | Nrimo / Syukur| Sukur | 感謝に満ちた | 感恩 | Agradecido/a | ممتن |
| **Green**| `serene` | Damai | Serene | Tentrem | Tengtrem | のどかな | 安宁 | Sereno/a | مطمئن |
| **Green**| `content` | Cukup Puas | Content | Cekap Remen | Sugema | 満ち足りた | 知足 | Satisfecho/a | راضٍ |

---

## 5. Interaction Math & Canvas Coordinates

When implementing a responsive touch/pointer coordinate picker:
```typescript
/**
 * Normalizes touch/mouse event coordinates inside a bounded container
 * to normalized valence and arousal (-1.0 to +1.0).
 */
export function getCoordinatesFromEvent(
  e: React.PointerEvent<HTMLDivElement>,
  rect: DOMRect
): { valence: number; arousal: number } {
  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const relX = clamp(e.clientX - rect.left, 0, rect.width);
  const relY = clamp(e.clientY - rect.top, 0, rect.height);

  // X axis: 0 (left = -1) -> width (right = +1)
  const valence = Number(((relX / rect.width) * 2 - 1).toFixed(2));
  
  // Y axis: 0 (top = +1) -> height (bottom = -1) (inverted screen coordinate)
  const arousal = Number((1 - (relY / rect.height) * 2).toFixed(2));

  return { valence, arousal };
}
```

---

## 6. Clinical Safety & Intervention Bridging

Never leave the user in high-distress quadrants without an immediate somatic exit:
1. **Red Quadrant Alert ($\text{Arousal} \ge +0.6$, $\text{Valence} \le -0.6$)**:
   - Offer one-tap launch to **DBT TIPP Cold Temperature** or **Cyclic Sighing**.
   - Do NOT ask user to write long cognitive essays; high sympathetic activation impairs prefrontal executive function.
2. **Blue Quadrant Alert ($\text{Arousal} \le -0.6$, $\text{Valence} \le -0.6$)**:
   - Avoid aggressive exercise demands; suggest low-threshold **Behavioral Activation micro-actions** (e.g. 5-minute sunlight or warm drink) and somatic grounding.
