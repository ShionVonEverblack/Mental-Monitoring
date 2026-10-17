import { describe, it, expect } from 'vitest';
import { detectCrisis, getCrisisKeywords, evaluateCssrsRiskTier } from '../crisisDetectionService';

describe('Crisis Detection Service & Zero-Trust Negation Guard', () => {
  it('returns not detected for regular safe text', () => {
    const result = detectCrisis('Hari ini saya merasa senang dan produktif di tempat kerja.');
    expect(result.isDetected).toBe(false);
    expect(result.severity).toBe('none');
    expect(result.cssrsTier).toBe('none');
    expect(result.isRecovery).toBe(false);
    expect(result.matchedKeywords.length).toBe(0);
  });

  it('detects severe Indonesian keywords correctly', () => {
    const result = detectCrisis('Saya merasa ingin bunuh diri dan tidak tahu harus berbuat apa.');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('bunuh diri');
    expect(result.isRecovery).toBe(false);
  });

  it('detects severe English keywords correctly', () => {
    const result = detectCrisis('I want to end my life, everything is too hard.');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('end my life');
  });

  it('detects moderate crisis keywords', () => {
    const result = detectCrisis('Rasanya putus asa dan tidak berguna sama sekali.');
    expect(result.isDetected).toBe(true);
    expect(['moderate', 'severe']).toContain(result.severity);
    expect(result.matchedKeywords.some(k => ['putus asa', 'tidak berguna'].includes(k))).toBe(true);
  });

  it('handles case insensitivity and punctuation', () => {
    const result = detectCrisis('SUICIDE thoughts are overwhelming me...');
    expect(result.isDetected).toBe(true);
    expect(result.severity).toBe('severe');
    expect(result.matchedKeywords).toContain('suicide');
  });

  it('handles empty or whitespace-only input safely', () => {
    const emptyResult = detectCrisis('');
    expect(emptyResult.isDetected).toBe(false);
    expect(emptyResult.severity).toBe('none');
    expect(emptyResult.cssrsTier).toBe('none');

    const whitespaceResult = detectCrisis('    \n   ');
    expect(whitespaceResult.isDetected).toBe(false);
    expect(whitespaceResult.severity).toBe('none');
    expect(whitespaceResult.cssrsTier).toBe('none');
  });

  it('returns all keyword categories from getCrisisKeywords', () => {
    const kw = getCrisisKeywords();
    expect(kw.severe.length).toBeGreaterThan(0);
    expect(kw.moderate.length).toBeGreaterThan(0);
    expect(kw.mild.length).toBeGreaterThan(0);
  });

  // ─── Acceptance Criteria 1: Pure Negation & Recovery Guard ────────────────

  describe('Negation Guard & Recovery Context (Zero False-Positive)', () => {
    it('marks pure recovery sentence "aku sudah tidak ingin menyakiti diri lagi" as safe recovery without alarm', () => {
      const input = 'aku sudah tidak ingin menyakiti diri lagi';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.cssrsTier).toBe('none');
      expect(result.isRecovery).toBe(true);
      expect(result.isNegated).toBe(true);
      expect(result.recoveryAffirmationKey).toBe('crisis.recoveryAffirmation');
    });

    it('marks "bukan mau bunuh diri" as safe negated input', () => {
      const input = 'bukan mau bunuh diri, aku cuma capek kerjaan kantor';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.isRecovery).toBe(true);
    });

    it('marks English recovery "I don\'t want to die anymore" as safe recovery', () => {
      const input = "I don't want to die anymore, things are slowly getting brighter.";
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.isRecovery).toBe(true);
    });

    it('marks "tidak ingin menyakiti diri lagi" as recovery', () => {
      const input = 'aku tidak ingin menyakiti diri lagi, terima kasih atas bantuannya';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(false);
      expect(result.isRecovery).toBe(true);
    });

    it('marks clean recovery from self-harm as safe', () => {
      const input = 'I am clean from self harm for 6 months and recovering';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(false);
      expect(result.isRecovery).toBe(true);
    });

    it('handles multilingual recovery expressions in Japanese, Chinese, Spanish, Arabic, Javanese, Sundanese', () => {
      // Japanese
      expect(detectCrisis('もう死にたくない').isDetected).toBe(false);
      // Chinese
      expect(detectCrisis('我不想自杀了').isDetected).toBe(false);
      // Spanish
      expect(detectCrisis('ya no quiero morir, me siento mejor').isDetected).toBe(false);
      // Arabic
      expect(detectCrisis('لا أريد الموت الحمد لله').isDetected).toBe(false);
      // Javanese
      expect(detectCrisis('wis ora gelem bunuh diri maneh').isDetected).toBe(false);
      // Sundanese
      expect(detectCrisis('tos teu hayang nyiksa diri deui').isDetected).toBe(false);
    });
  });

  // ─── Acceptance Criteria 2: Compound Contrast Sentences ───────────────────

  describe('Contrast Compound Sentences (Preserving 100% Active Crisis Sensitivity)', () => {
    it('detects active crisis in "Dulu aku bilang tidak mau bunuh diri, tapi malam ini aku ingin mengakhiri semuanya"', () => {
      const input = 'Dulu aku bilang tidak mau bunuh diri, tapi malam ini aku ingin mengakhiri semuanya';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.cssrsTier).toBe('tier3_acute_imminent');
      expect(result.isRecovery).toBe(false);
    });

    it('detects active crisis in "tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup"', () => {
      const input = 'tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.cssrsTier).toBe('tier3_acute_imminent');
      expect(result.matchedKeywords).toContain('mengakhiri hidup');
    });

    it('detects active crisis in English contrast "I said I wouldn\'t kill myself, but tonight I want to end it all"', () => {
      const input = "I said I wouldn't kill myself, but tonight I want to end it all";
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.cssrsTier).toBe('tier3_acute_imminent');
    });
  });

  // ─── Acceptance Criteria 3: Inherent Distress Keywords (Zero False-Negative) ──

  describe('Inherent Negative Expressions (Distress NOT Negated by Internal Words)', () => {
    it('correctly triggers severe crisis for "tidak mau hidup lagi"', () => {
      const input = 'aku sudah lelah dan tidak mau hidup lagi';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.matchedKeywords).toContain('tidak mau hidup lagi');
    });

    it('correctly triggers severe crisis for slang "gamau hidup"', () => {
      const input = 'capek banget rasanya gamau hidup';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
    });

    it('correctly triggers for "tidak ada harapan"', () => {
      const input = 'sepertinya sudah tidak ada harapan lagi untuk masa depanku';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.matchedKeywords).toContain('tidak ada harapan');
    });
  });

  // ─── Acceptance Criteria 4: C-SSRS Triase Levels ──────────────────────────

  describe('C-SSRS Tiered Triage', () => {
    it('classifies passive hopelessness as Tier 1 (C-SSRS Passive Ideation)', () => {
      const input = 'Rasanya putus asa, lelah hidup dan tidak berguna';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.cssrsTier).toBe('tier1_passive');
      expect(['mild', 'moderate', 'severe']).toContain(result.severity);
    });

    it('classifies active ideation without specific lethal plan as Tier 2 (C-SSRS Active Ideation)', () => {
      const input = 'Aku merasa ingin mati dan bunuh diri';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.cssrsTier).toBe('tier2_active_no_plan');
      expect(result.severity).toBe('severe');
    });

    it('classifies lethal means + temporal marker as Tier 3 (C-SSRS Acute Imminent)', () => {
      const input = 'Saya punya obat tidur banyak dan akan diminum malam ini';
      const result = detectCrisis(input);

      expect(result.isDetected).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.cssrsTier).toBe('tier3_acute_imminent');
      expect(result.matchedKeywords).toContain('obat tidur');
      expect(result.matchedKeywords).toContain('malam ini');
    });

    it('evaluates risk tier through evaluateCssrsRiskTier helper', () => {
      const res = evaluateCssrsRiskTier('gantung diri malam ini');
      expect(res.isDetected).toBe(true);
      expect(res.tier).toBe('tier3_acute_imminent');
      expect(res.severity).toBe('severe');
    });

    it('classifies explicit suicide plan as Tier 3 Acute Imminent (C-SSRS Level 5 Plan/Intent)', () => {
      const planIndo = detectCrisis('aku punya rencana bunuh diri');
      expect(planIndo.isDetected).toBe(true);
      expect(planIndo.cssrsTier).toBe('tier3_acute_imminent');

      const planEn = detectCrisis('I have a plan to end my life');
      expect(planEn.isDetected).toBe(true);
      expect(planEn.cssrsTier).toBe('tier3_acute_imminent');
    });

    it('classifies imminent temporal targets (besok, nanti malam, tomorrow) as Tier 3', () => {
      const besokRes = detectCrisis('aku mau bunuh diri besok');
      expect(besokRes.isDetected).toBe(true);
      expect(besokRes.cssrsTier).toBe('tier3_acute_imminent');

      const nantiMalamRes = detectCrisis('aku mau bunuh diri nanti malam');
      expect(nantiMalamRes.isDetected).toBe(true);
      expect(nantiMalamRes.cssrsTier).toBe('tier3_acute_imminent');
    });

    it('detects C-SSRS Level 1 "Wish to be Dead" as Tier 1 Passive Ideation', () => {
      const wishEn = detectCrisis('I wish I were dead');
      expect(wishEn.isDetected).toBe(true);
      expect(wishEn.cssrsTier).toBe('tier1_passive');

      const lebihBaikMati = detectCrisis('rasanya lebih baik mati saja');
      expect(lebihBaikMati.isDetected).toBe(true);
      expect(lebihBaikMati.cssrsTier).toBe('tier1_passive');

      const berharapMati = detectCrisis('setiap malam aku berharap tidak bangun lagi');
      expect(berharapMati.isDetected).toBe(true);
      expect(berharapMati.cssrsTier).toBe('tier1_passive');
    });
  });

  // ─── Adversarial Edge Cases: Double Negatives, Past Contrast & Concessives ──

  describe('Adversarial Edge Cases: Double Negatives & Past Contrast Resolution', () => {
    it('detects active crisis in double negatives ("bukan berarti tidak ingin bunuh diri")', () => {
      const doubleNeg1 = detectCrisis('bukan berarti aku tidak ingin bunuh diri');
      expect(doubleNeg1.isDetected).toBe(true);
      expect(doubleNeg1.isRecovery).toBe(false);
      expect(['tier2_active_no_plan', 'tier3_acute_imminent']).toContain(doubleNeg1.cssrsTier);

      const doubleNeg2 = detectCrisis('tidak berarti aku tidak mau mati');
      expect(doubleNeg2.isDetected).toBe(true);
      expect(doubleNeg2.isRecovery).toBe(false);

      const doubleNeg3 = detectCrisis("it's not that I don't want to die");
      expect(doubleNeg3.isDetected).toBe(true);
      expect(doubleNeg3.isRecovery).toBe(false);
    });

    it('resolves past crisis contrasted with present recovery as safe recovery ("dulu mau bunuh diri tapi sekarang pulih")', () => {
      const pastRecovery1 = detectCrisis('dulu aku mau bunuh diri, tapi sekarang aku sudah pulih');
      expect(pastRecovery1.isDetected).toBe(false);
      expect(pastRecovery1.isRecovery).toBe(true);

      const pastRecovery2 = detectCrisis("I used to want to kill myself, but now I'm clean and feeling better");
      expect(pastRecovery2.isDetected).toBe(false);
      expect(pastRecovery2.isRecovery).toBe(true);

      const pastRecovery3 = detectCrisis('tahun lalu aku pernah mencoba bunuh diri, namun sekarang aku bersyukur masih hidup');
      expect(pastRecovery3.isDetected).toBe(false);
      expect(pastRecovery3.isRecovery).toBe(true);

      const pastRecovery4 = detectCrisis('dulu aku sempat mau bunuh diri sekarang sudah tidak lagi');
      expect(pastRecovery4.isDetected).toBe(false);
      expect(pastRecovery4.isRecovery).toBe(true);
    });

    it('treats external negation of inherent keywords as safe recovery ("bukan tidak mau hidup lagi")', () => {
      const extNeg = detectCrisis('aku bukan tidak mau hidup lagi, aku cuma lelah');
      expect(extNeg.isDetected).toBe(false);
      expect(extNeg.isRecovery).toBe(true);
    });

    it('treats mild distress coupled with explicit negation of suicide as safe recovery ("sedih tapi tidak akan bunuh diri")', () => {
      const concessive = detectCrisis('meskipun aku sangat sedih, aku tidak akan bunuh diri');
      expect(concessive.isDetected).toBe(false);
      expect(concessive.isRecovery).toBe(true);
    });
  });

  // ─── Acceptance Criteria 5: Deterministic Latency (<5ms) ──────────────────

  describe('Performance & Latency Gate (<5ms deterministic runtime)', () => {
    it('executes in strictly under 5 milliseconds on diverse inputs', () => {
      const testInputs = [
        'Hari ini saya merasa senang dan produktif di tempat kerja.',
        'aku sudah tidak ingin menyakiti diri lagi',
        'Dulu aku bilang tidak mau bunuh diri, tapi malam ini aku ingin mengakhiri semuanya',
        'tadinya tidak mau bunuh diri, tapi sekarang ingin mengakhiri hidup',
        'Saya sudah kumpulkan obat tidur banyak untuk malam ini selamat tinggal semuanya',
        'I want to end my life, everything is too hard.',
        'Rasanya putus asa dan tidak berguna sama sekali.',
        'もう死にたくない、前を向いて生きていきます。',
        '我不想自杀了，感谢大家对我的支持和陪伴。',
        'bukan berarti aku tidak ingin bunuh diri',
        'dulu aku mau bunuh diri, tapi sekarang aku sudah pulih',
      ];

      for (const input of testInputs) {
        const start = performance.now();
        const result = detectCrisis(input);
        const duration = performance.now() - start;

        expect(result).toBeDefined();
        expect(duration).toBeLessThan(5); // Must be strictly < 5ms
      }
    });
  });

  // ─── Adversarial Review Round 2: Edge Cases, Regional Slang & Non-Latin Punctuation ──

  describe('Adversarial Review Round 2: Edge Cases, Regional Slang & Robustness', () => {
    it('detects active crisis when past recovery is followed by recent relapse', () => {
      const relapseRes = detectCrisis('Dulu aku sempat sembuh, tapi kemarin aku mau bunuh diri lagi');
      expect(relapseRes.isDetected).toBe(true);
      expect(relapseRes.isRecovery).toBe(false);
      expect(relapseRes.matchedKeywords).toContain('bunuh diri');

      const relapseEn = detectCrisis('In the past I was feeling much better, but yesterday I wanted to kill myself again');
      expect(relapseEn.isDetected).toBe(true);
      expect(relapseEn.isRecovery).toBe(false);
      expect(relapseEn.matchedKeywords).toContain('kill myself');

      const relapseLethal = detectCrisis('Dulu aku sudah sembuh, tapi kemarin aku memutuskan loncat dari jembatan malam ini');
      expect(relapseLethal.isDetected).toBe(true);
      expect(relapseLethal.cssrsTier).toBe('tier3_acute_imminent');
    });

    it('handles CJK and Arabic punctuation delimiters in compound sentences', () => {
      const zhRes = detectCrisis('现在康复了。今晚我要自杀。');
      expect(zhRes.isDetected).toBe(true);
      expect(zhRes.cssrsTier).toBe('tier3_acute_imminent');
      expect(zhRes.matchedKeywords).toContain('自杀');

      const arRes = detectCrisis('الآن تعافيت. الليلة سوف أنتحر.');
      expect(arRes.isDetected).toBe(true);
      expect(arRes.cssrsTier).toBe('tier3_acute_imminent');
      expect(arRes.matchedKeywords).toContain('أنتحر');
    });

    it('detects regional slang in Javanese and Sundanese', () => {
      const jvSlang = detectCrisis('aku wis wegah urip');
      expect(jvSlang.isDetected).toBe(true);
      expect(jvSlang.matchedKeywords).toContain('wegah urip');

      const suSlang = detectCrisis('abdi hoream hirup');
      expect(suSlang.isDetected).toBe(true);
      expect(suSlang.matchedKeywords).toContain('hoream hirup');
    });

    it('correctly affirms recovery across regional and multilingual negative forms', () => {
      const suRec = detectCrisis('abdi teu hoyong ngagantung deui');
      expect(suRec.isDetected).toBe(false);
      expect(suRec.isRecovery).toBe(true);

      const jvRec = detectCrisis('kula mboten badhe mateni awak dewe malih');
      expect(jvRec.isDetected).toBe(false);
      expect(jvRec.isRecovery).toBe(true);

      const jaRec = detectCrisis('もう自殺なんてしない');
      expect(jaRec.isDetected).toBe(false);
      expect(jaRec.isRecovery).toBe(true);

      const arRec = detectCrisis('لا أريد أن أقتل نفسي بعد الآن');
      expect(arRec.isDetected).toBe(false);
      expect(arRec.isRecovery).toBe(true);

      const esRec = detectCrisis('No tengo intención de suicidio');
      expect(esRec.isDetected).toBe(false);
      expect(esRec.isRecovery).toBe(true);
    });

    it('handles conversational pauses, emoticons, character elongation, and hyphenated words', () => {
      const ellipsisRes = detectCrisis('bukan mau... bunuh diri');
      expect(ellipsisRes.isDetected).toBe(false);
      expect(ellipsisRes.isRecovery).toBe(true);

      const emoticonRes = detectCrisis('aku tidak mau :( bunuh diri');
      expect(emoticonRes.isDetected).toBe(false);
      expect(emoticonRes.isRecovery).toBe(true);

      const elongatedRes = detectCrisis('aku mau bunuuuh diri');
      expect(elongatedRes.isDetected).toBe(true);
      expect(elongatedRes.matchedKeywords).toContain('bunuh diri');

      const hyphenatedRes = detectCrisis('aku mau bunuh-diri');
      expect(hyphenatedRes.isDetected).toBe(true);
      expect(hyphenatedRes.matchedKeywords).toContain('bunuh diri');
    });

    it('triages regional temporal targets to Tier 3 Acute Imminent', () => {
      const jvTriage = detectCrisis('aku sesuk arep kendhat');
      expect(jvTriage.isDetected).toBe(true);
      expect(jvTriage.cssrsTier).toBe('tier3_acute_imminent');

      const suTriage = detectCrisis('isukan abdi hayang paeh');
      expect(suTriage.isDetected).toBe(true);
      expect(suTriage.cssrsTier).toBe('tier3_acute_imminent');
    });

    it('intercepts double negations in regional languages as active crisis', () => {
      const jvDoubleNeg = detectCrisis('dudu tegese aku ora pengen bunuh diri');
      expect(jvDoubleNeg.isDetected).toBe(true);

      const suDoubleNeg = detectCrisis('sanes hartosna abdi teu hoyong bunuh diri');
      expect(suDoubleNeg.isDetected).toBe(true);
    });

    it('intercepts leetspeak obfuscation variations across supported languages', () => {
      const leetBundir = detectCrisis('aku mau bund1r');
      expect(leetBundir.isDetected).toBe(true);
      expect(leetBundir.matchedKeywords).toContain('bundir');

      const leetBunuhDiri = detectCrisis('aku mau bunuh d1r1');
      expect(leetBunuhDiri.isDetected).toBe(true);
      expect(leetBunuhDiri.matchedKeywords).toContain('bunuh diri');

      const leetKill = detectCrisis('i want to k1ll myself');
      expect(leetKill.isDetected).toBe(true);
      expect(leetKill.matchedKeywords).toContain('kill myself');

      const leetSuicide = detectCrisis('i will su1c1de');
      expect(leetSuicide.isDetected).toBe(true);
      expect(leetSuicide.matchedKeywords).toContain('suicide');

      const leetMauMati = detectCrisis('aku m4u m4t1');
      expect(leetMauMati.isDetected).toBe(true);
      expect(leetMauMati.matchedKeywords).toContain('mau mati');
    });

    it('intercepts punctuation-separated and spaced single-letter obfuscation', () => {
      const punctBunuhDiri = detectCrisis('aku mau b.u.n.u.h d.i.r.i');
      expect(punctBunuhDiri.isDetected).toBe(true);
      expect(punctBunuhDiri.matchedKeywords).toContain('bunuh diri');

      const spacedBunuhDiri = detectCrisis('aku mau b u n u h  d i r i');
      expect(spacedBunuhDiri.isDetected).toBe(true);
      expect(spacedBunuhDiri.matchedKeywords).toContain('bunuh diri');

      const punctSuicide = detectCrisis('s.u.i.c.i.d.e');
      expect(punctSuicide.isDetected).toBe(true);
      expect(punctSuicide.matchedKeywords).toContain('suicide');

      const punctBundir = detectCrisis('aku mau b*u*n*d*i*r');
      expect(punctBundir.isDetected).toBe(true);
      expect(punctBundir.matchedKeywords).toContain('bundir');

      const punctKill = detectCrisis('k.i.l.l  m.y.s.e.l.f');
      expect(punctKill.isDetected).toBe(true);
      expect(punctKill.matchedKeywords).toContain('kill myself');
    });

    it('detects unspaced compound crisis and self-harm keywords', () => {
      const compoundBunuhdiri = detectCrisis('aku mau bunuhdiri');
      expect(compoundBunuhdiri.isDetected).toBe(true);
      expect(compoundBunuhdiri.matchedKeywords).toContain('bunuhdiri');

      const compoundKillmyself = detectCrisis('i will killmyself');
      expect(compoundKillmyself.isDetected).toBe(true);
      expect(compoundKillmyself.matchedKeywords).toContain('killmyself');

      const compoundSelfharm = detectCrisis('i do selfharm');
      expect(compoundSelfharm.isDetected).toBe(true);
      expect(compoundSelfharm.matchedKeywords).toContain('selfharm');

      const compoundGantungdiri = detectCrisis('dia mau gantungdiri');
      expect(compoundGantungdiri.isDetected).toBe(true);
      expect(compoundGantungdiri.matchedKeywords).toContain('gantungdiri');
    });

    it('detects Spanish active reflexive verbs for suicide', () => {
      const esReflexive1 = detectCrisis('quiero suicidarme');
      expect(esReflexive1.isDetected).toBe(true);
      expect(esReflexive1.matchedKeywords).toContain('suicidarme');

      const esReflexive2 = detectCrisis('me voy a suicidar');
      expect(esReflexive2.isDetected).toBe(true);
      expect(esReflexive2.matchedKeywords).toContain('suicidar');
    });

    it('detects Arabic smartphone inputs typed without hamza', () => {
      const arBare1 = detectCrisis('اريد الموت');
      expect(arBare1.isDetected).toBe(true);
      expect(arBare1.matchedKeywords).toContain('اريد الموت');

      const arBare2 = detectCrisis('انتحر');
      expect(arBare2.isDetected).toBe(true);
      expect(arBare2.matchedKeywords).toContain('انتحر');

      const arBare3 = detectCrisis('اقتل نفسي');
      expect(arBare3.isDetected).toBe(true);
      expect(arBare3.matchedKeywords).toContain('اقتل نفسي');
    });

    it('intercepts loss-of-will to live expressions in English and colloquial Indonesian', () => {
      const enLive1 = detectCrisis("I don't want to live anymore");
      expect(enLive1.isDetected).toBe(true);
      expect(enLive1.cssrsTier).toBe('tier2_active_no_plan');

      const enLive2 = detectCrisis('I do not want to live');
      expect(enLive2.isDetected).toBe(true);

      const idLiveColloquial1 = detectCrisis('aku gak mau hidup');
      expect(idLiveColloquial1.isDetected).toBe(true);

      const idLiveColloquial2 = detectCrisis('aku gamau idup lagi');
      expect(idLiveColloquial2.isDetected).toBe(true);
    });

    it('preserves negation guard and recovery affirmation on de-obfuscated inputs', () => {
      const recSpaced = detectCrisis('aku sudah tidak ingin b.u.n.u.h  d.i.r.i lagi');
      expect(recSpaced.isDetected).toBe(false);
      expect(recSpaced.isRecovery).toBe(true);

      const recBundir = detectCrisis('bukan mau b u n d i r');
      expect(recBundir.isDetected).toBe(false);
      expect(recBundir.isRecovery).toBe(true);
    });
  });
});
