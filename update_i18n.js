const fs = require('fs');
const path = require('path');

function updateJson(file, newKeys, lang) {
  const filePath = path.join(__dirname, 'src', 'i18n', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.insights = newKeys.insights;
  data.breathe = newKeys.breathe;
  data.education = newKeys.education;
  data.escalation = newKeys.escalation;
  data.crisis = newKeys.crisis;

  if (!data.home) data.home = {};
  data.home.education = lang === 'id' ? 'Edukasi' : 'Education';

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const idKeys = {
  "insights": {
    "weeklyTitle": "Insight Mingguan",
    "exerciseHelps": "Olahraga Meningkatkan Mood",
    "exerciseHelpsDesc": "Saat kamu berolahraga, moodmu cenderung lebih tinggi. Pertahankan kebiasaan baik ini!",
    "sleepAffects": "Tidur Memengaruhi Mood",
    "sleepAffectsDesc": "Pola tidur yang buruk berkorelasi dengan mood rendah. Coba atur jadwal tidurmu.",
    "weekdayPattern": "Pola Hari Kerja",
    "weekdayPatternDesc": "Moodmu cenderung lebih rendah di hari kerja. Coba luangkan waktu untuk self-care.",
    "improving": "Mood Membaik",
    "improvingDesc": "Tren moodmu menunjukkan perbaikan. Terus pertahankan!",
    "declining": "Perhatikan Moodmu",
    "decliningDesc": "Tren moodmu menurun belakangan ini. Jangan ragu untuk berbicara dengan seseorang.",
    "stable": "Mood Stabil",
    "stableDesc": "Moodmu cukup stabil minggu ini. Itu hal yang baik!"
  },
  "breathe": {
    "title": "Latihan Pernapasan",
    "subtitle": "Tenangkan pikiran dengan teknik pernapasan",
    "technique478": "4-7-8",
    "technique478Desc": "Tarik 4 detik, tahan 7, buang 8",
    "techniqueBox": "Box Breathing",
    "techniqueBoxDesc": "4 detik setiap fase",
    "techniqueCalm": "Simple Calm",
    "techniqueCalmDesc": "4 detik masuk, 4 detik keluar",
    "start": "Mulai",
    "stop": "Berhenti",
    "inhale": "Tarik Napas",
    "hold": "Tahan",
    "exhale": "Buang Napas",
    "cycles": "Siklus",
    "duration": "Durasi"
  },
  "education": {
    "title": "Edukasi Kesehatan Mental",
    "subtitle": "Pelajari tentang kesehatan mentalmu"
  },
  "escalation": {
    "level1": "Sepertinya kamu sedang kurang baik belakangan ini. Tidak apa-apa untuk merasa begitu. Coba luangkan waktu untuk dirimu sendiri.",
    "level2": "Kami perhatikan moodmu sedang turun. Kamu tidak sendirian. Coba berbagi di forum atau review rencana keselamatanmu.",
    "level3": "Kamu terlihat sedang mengalami masa yang sangat berat. Bantuan profesional tersedia untukmu 24/7.",
    "tryBreathing": "Latihan Pernapasan",
    "writeJournal": "Tulis Jurnal",
    "visitForum": "Kunjungi Forum",
    "reviewSafety": "Review Rencana Keselamatan",
    "contactHelp": "Hubungi Bantuan"
  },
  "crisis": {
    "weNoticed": "Kami Memperhatikan...",
    "gentleMessage": "Tulisanmu menunjukkan bahwa kamu mungkin sedang mengalami masa sulit. Kamu tidak sendirian, dan ada bantuan yang tersedia.",
    "contactHelp": "🆘 Hubungi Bantuan Krisis",
    "safetyPlan": "📋 Lihat Rencana Keselamatan",
    "imOk": "Saya baik-baik saja, terima kasih"
  }
};

const enKeys = {
  "insights": {
    "weeklyTitle": "Weekly Insights",
    "exerciseHelps": "Exercise Boosts Your Mood",
    "exerciseHelpsDesc": "When you exercise, your mood tends to be higher. Keep up this great habit!",
    "sleepAffects": "Sleep Affects Your Mood",
    "sleepAffectsDesc": "Poor sleep patterns correlate with lower moods. Try adjusting your sleep schedule.",
    "weekdayPattern": "Weekday Pattern",
    "weekdayPatternDesc": "Your mood tends to be lower on weekdays. Try making time for self-care.",
    "improving": "Mood Improving",
    "improvingDesc": "Your mood trend is showing improvement. Keep it up!",
    "declining": "Watch Your Mood",
    "decliningDesc": "Your mood has been declining recently. Don't hesitate to talk to someone.",
    "stable": "Stable Mood",
    "stableDesc": "Your mood has been quite stable this week. That's a good thing!"
  },
  "breathe": {
    "title": "Breathing Exercises",
    "subtitle": "Calm your mind with breathing techniques",
    "technique478": "4-7-8",
    "technique478Desc": "Inhale 4s, hold 7s, exhale 8s",
    "techniqueBox": "Box Breathing",
    "techniqueBoxDesc": "4 seconds each phase",
    "techniqueCalm": "Simple Calm",
    "techniqueCalmDesc": "4s in, 4s out",
    "start": "Start",
    "stop": "Stop",
    "inhale": "Inhale",
    "hold": "Hold",
    "exhale": "Exhale",
    "cycles": "Cycles",
    "duration": "Duration"
  },
  "education": {
    "title": "Mental Health Education",
    "subtitle": "Learn about your mental health"
  },
  "escalation": {
    "level1": "It seems like you've been having a tough time lately. It's okay to feel this way. Try taking some time for yourself.",
    "level2": "We've noticed your mood has been declining. You're not alone. Try sharing in the forum or reviewing your safety plan.",
    "level3": "You seem to be going through a very difficult time. Professional help is available for you 24/7.",
    "tryBreathing": "Breathing Exercise",
    "writeJournal": "Write Journal",
    "visitForum": "Visit Forum",
    "reviewSafety": "Review Safety Plan",
    "contactHelp": "Contact Help"
  },
  "crisis": {
    "weNoticed": "We Noticed...",
    "gentleMessage": "Your writing suggests you may be going through a difficult time. You are not alone, and help is available.",
    "contactHelp": "🆘 Contact Crisis Help",
    "safetyPlan": "📋 View Safety Plan",
    "imOk": "I'm okay, thank you"
  }
};

updateJson('id.json', idKeys, 'id');
updateJson('en.json', enKeys, 'en');
console.log('done');
