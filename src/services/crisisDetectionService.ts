export interface CrisisDetectionResult {
  isDetected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  matchedKeywords: string[];
  suggestedActionKey: string;
  suggestedActionFallback: string;
}

const keywords = {
  severe: [
    'bunuh diri', 'suicide', 'mau mati', 'ingin mati', 'want to die', 
    'kill myself', 'end my life', 'mengakhiri hidup', 'gantung diri', 'tidak mau hidup lagi'
  ],
  moderate: [
    'menyakiti diri', 'self harm', 'cut myself', 'putus asa', 'hopeless', 
    'tidak ada harapan', 'no hope', 'tidak berguna', 'worthless', 'beban', 'burden'
  ],
  mild: [
    'sangat sedih', 'sangat tertekan', 'overwhelmed', 'kewalahan', 
    'tidak tahan', "can't take it", 'lelah hidup', 'tired of living'
  ]
};

export function getCrisisKeywords(): { severe: string[], moderate: string[], mild: string[] } {
  return keywords;
}

export function detectCrisis(text: string): CrisisDetectionResult {
  if (!text) {
    return {
      isDetected: false,
      severity: 'none',
      matchedKeywords: [],
      suggestedActionKey: '',
      suggestedActionFallback: ''
    };
  }

  const normalizedText = text.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let score = 0;

  // Check severe keywords
  keywords.severe.forEach(kw => {
    if (normalizedText.includes(kw)) {
      matchedKeywords.push(kw);
      score += 10;
    }
  });

  // Check moderate keywords
  keywords.moderate.forEach(kw => {
    if (normalizedText.includes(kw)) {
      matchedKeywords.push(kw);
      score += 5;
    }
  });

  // Check mild keywords
  keywords.mild.forEach(kw => {
    if (normalizedText.includes(kw)) {
      matchedKeywords.push(kw);
      score += 2;
    }
  });

  const uniqueMatches = Array.from(new Set(matchedKeywords));

  let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  let suggestedActionKey = '';
  let suggestedActionFallback = '';

  if (score >= 10) {
    severity = 'severe';
    suggestedActionKey = 'crisis.severeAction';
    suggestedActionFallback = 'Segera hubungi layanan darurat atau seseorang yang Anda percayai.';
  } else if (score >= 5) {
    severity = 'moderate';
    suggestedActionKey = 'crisis.moderateAction';
    suggestedActionFallback = 'Pertimbangkan untuk berbicara dengan konselor atau teman dekat.';
  } else if (score >= 2) {
    severity = 'mild';
    suggestedActionKey = 'crisis.mildAction';
    suggestedActionFallback = 'Cobalah latihan pernapasan atau tuliskan perasaan Anda di jurnal.';
  }

  return {
    isDetected: score > 0,
    severity,
    matchedKeywords: uniqueMatches,
    suggestedActionKey,
    suggestedActionFallback
  };
}
