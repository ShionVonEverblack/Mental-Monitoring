---
name: rima-i18n-management
description: >-
  Guide for managing internationalization (i18n) in the RIMA project.
  Use when adding new UI strings, creating new components with text,
  adding a new language, or fixing translation issues.
  RIMA supports 8 languages: id, en, jv, su, ja, zh, es, ar.
---

# RIMA i18n Management

## Configuration
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Config: `src/i18n/config.ts`
- Fallback: `id` (Indonesian)
- Detection: `localStorage` key `i18nextLng`

## Translation Files
All at `src/i18n/`:

| File | Language | Script |
|:---|:---|:---|
| `id.json` | Indonesian (Bahasa) | Latin |
| `en.json` | English | Latin |
| `jv.json` | Javanese (Basa Jawa) | Latin |
| `su.json` | Sundanese (Basa Sunda) | Latin |
| `ja.json` | Japanese (日本語) | CJK |
| `zh.json` | Chinese Simplified (简体中文) | CJK |
| `es.json` | Spanish (Español) | Latin |
| `ar.json` | Arabic (العربية) | Arabic (RTL) |

## How to Add New Keys

### Step 1: Use `t()` in Components
```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Always provide Indonesian fallback
<p>{t('section.keyName', 'Teks fallback dalam Bahasa Indonesia')}</p>
```

### Step 2: Add to ALL 8 Translation Files
**CRITICAL**: New keys MUST be added to ALL 8 files. Use this batch script pattern:

```javascript
// Save as a scratch script and run with: node script.js
const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\Hype\\Kuliah\\Proyekan\\mental monitoring\\src\\i18n';

const NEW_KEYS = {
  id: { "key.name": "Teks Indonesia" },
  en: { "key.name": "English text" },
  jv: { "key.name": "Teks Jawa" },
  su: { "key.name": "Teks Sunda" },
  ja: { "key.name": "日本語テキスト" },
  zh: { "key.name": "中文文本" },
  es: { "key.name": "Texto en español" },
  ar: { "key.name": "نص عربي" }
};

for (const [lang, keys] of Object.entries(NEW_KEYS)) {
  const file = path.join(dir, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
  Object.assign(content, keys);
  fs.writeFileSync(file, JSON.stringify(content, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${lang}.json`);
}
```

### Step 3: Verify
```bash
# Check all files have the same key count
node -e "const fs=require('fs'),p='src/i18n/';['id','en','jv','su','ja','zh','es','ar'].forEach(l=>{const k=Object.keys(JSON.parse(fs.readFileSync(p+l+'.json','utf-8')));console.log(l+': '+k.length+' keys')})"
```

## Key Naming Convention
Use dot-separated hierarchical keys:
- `nav.home`, `nav.mood`, `nav.journal`
- `breathe.tech.coherent`, `breathe.desc.coherent`
- `crisis.interceptorTitle`, `crisis.severeAction`
- `disclaimer.clinical`, `disclaimer.crisis`

## Arabic RTL Considerations
- Arabic text renders right-to-left
- Ensure UI layouts don't break with longer Arabic text
- Test number formatting (Arabic uses Eastern Arabic numerals)

## Language Switcher Locations
1. **Home page header**: Quick language button → modal with 8 flags
2. **Profile page**: Full language selector with labels

## Constants with Multilingual Content
Some static content is NOT in i18n files but in source code:
- `src/utils/constants.ts`: Affirmations (8 languages), crisis hotlines
- `src/data/educationContent.ts`: Articles (ID/EN only currently)
- `src/data/professionalServices.ts`: Indonesian services
- `src/data/spiritualContent.ts`: Multi-faith reflections
- `src/components/safety/SafetyPlan.tsx`: Suggestion chips (ID only, needs localization)
