import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JOURNAL_TEMPLATES } from '../utils/constants';
import type { JournalTemplate, JournalEntry } from '../types';
import { detectCrisis } from '../services/crisisDetectionService';
import { Modal } from '../components/ui/Modal';
import type { CrisisDetectionResult } from '../services/crisisDetectionService';
import { formatDate } from '../utils/helpers';

export const Journal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [journals, setJournals] = useLocalStorage<JournalEntry[]>('rima-journals', []);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [crisisResult, setCrisisResult] = useState<CrisisDetectionResult | null>(null);

  const lang = i18n.language?.split('-')[0] || 'id';

  const handleSave = () => {
    if (!title || !content) return;
    
    const now = new Date().toISOString();
    const newJournal: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      template: selectedTemplate || 'free',
      isPrivate: false,
      createdAt: now,
      updatedAt: now,
    };
    
    setJournals([newJournal, ...journals]);
    setSelectedTemplate(null);
    setTitle('');
    
    const result = detectCrisis(content);
    if (result.isDetected) {
      setCrisisResult(result);
    }
    
    setContent('');
  };

  return (
    <div className="journal-page">
      <header>
        <h1 className="page-title">{t('journal.title', { defaultValue: 'Jurnal' })}</h1>
      </header>

      <section className="templates-section">
        {!selectedTemplate ? (
          <div className="template-grid">
            {JOURNAL_TEMPLATES.map(tmpl => (
              <button 
                key={tmpl.id} 
                className={`template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(tmpl.id)}
                type="button"
              >
                <div className="template-icon"></div>
                <h3 className="template-name">{t(`journal.templates.${tmpl.id}`, lang === 'en' ? tmpl.labelEn : tmpl.labelId)}</h3>
                <p className="template-desc">{t(`journal.templateDesc.${tmpl.id}`, tmpl.description)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="journal-editor">
            <div className="editor-header">
              <h3>
                {(() => {
                  const tmpl = JOURNAL_TEMPLATES.find(t => t.id === selectedTemplate);
                  return tmpl ? t(`journal.templates.${tmpl.id}`, lang === 'en' ? tmpl.labelEn : tmpl.labelId) : '';
                })()}
              </h3>
              <button onClick={() => setSelectedTemplate(null)}>
                {t('common.cancel', { defaultValue: 'Batal' })}
              </button>
            </div>
            
            <input 
              type="text" 
              className="journal-title-input"
              placeholder={t('journal.titlePlaceholder', { defaultValue: 'Judul jurnal...' })}
              aria-label={t('journal.titlePlaceholder', { defaultValue: 'Judul jurnal...' })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {JOURNAL_TEMPLATES.find(t => t.id === selectedTemplate)?.prompts.map((prompt, idx) => (
               <div key={idx} className="journal-prompt">
                 <label className="journal-prompt-label">{t(`journal.prompts.${selectedTemplate}.${idx}`, lang === 'en' ? prompt.en : prompt.id)}</label>
               </div>
            ))}
            
            <textarea
              className="journal-content-input"
              placeholder={t('journal.contentPlaceholder', { defaultValue: 'Mulai menulis...' })}
              aria-label={t('journal.contentPlaceholder', { defaultValue: 'Mulai menulis...' })}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            
            <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
              {t('common.save', { defaultValue: 'Simpan Jurnal' })}
            </button>
          </div>
        )}
      </section>

      <section className="journal-history">
        <h3>{t('journal.history', { defaultValue: 'Catatan Sebelumnya' })}</h3>
        {journals.map(journal => (
          <div key={journal.id} className="journal-entry-card">
            <button 
              type="button"
              className="journal-entry-toggle"
              onClick={() => setExpandedId(expandedId === journal.id ? null : journal.id)}
              aria-expanded={expandedId === journal.id}
            >
              <h4 className="journal-entry-title">{journal.title}</h4>
              <div className="journal-entry-meta">
                <span className="journal-entry-date">{formatDate(journal.createdAt, lang)}</span>
              </div>
            </button>
            
            {expandedId === journal.id ? (
              <div className="journal-entry-preview">
                <p>{journal.content}</p>
              </div>
            ) : null}
          </div>
        ))}
        {journals.length === 0 && (
          <p>{t('journal.empty', { defaultValue: 'Belum ada catatan. Mulai menulis hari ini!' })}</p>
        )}
      </section>

      {crisisResult && (
        <Modal 
          isOpen={!!crisisResult}
          onClose={() => setCrisisResult(null)}
          title={t('crisis.weNoticed', 'Kami Memperhatikan...')}
        >
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 'var(--spacing-md)' }}>
            {t('crisis.gentleMessage', 'Tulisanmu menunjukkan bahwa kamu mungkin sedang mengalami masa sulit. Kamu tidak sendirian, dan ada bantuan yang tersedia.')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <button className="btn btn-danger" onClick={() => { navigate('/safety-plan'); setCrisisResult(null); }}>
              {t('crisis.contactHelp', '🆘 Hubungi Bantuan Krisis')}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/safety-plan')}>
              {t('crisis.safetyPlan', '📋 Lihat Rencana Keselamatan')}
            </button>
            <button className="btn btn-ghost" onClick={() => setCrisisResult(null)}>
              {t('crisis.imOk', 'Saya baik-baik saja, terima kasih')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
