import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JOURNAL_TEMPLATES } from '../utils/constants';
import type { JournalTemplate } from '../types';

export const Journal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [journals, setJournals] = useLocalStorage<any[]>('rima-journals', []);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const lang = i18n.language as 'id' | 'en';

  const handleSave = () => {
    if (!title || !content) return;
    
    const newJournal = {
      id: Date.now().toString(),
      title,
      content,
      template: selectedTemplate,
      date: new Date().toISOString(),
    };
    
    setJournals([newJournal, ...journals]);
    setSelectedTemplate(null);
    setTitle('');
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
              <div 
                key={tmpl.id} 
                className={`template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(tmpl.id)}
              >
                <div className="template-icon"></div>
                <h3 className="template-name">{lang === 'en' ? tmpl.labelEn : tmpl.labelId}</h3>
                <p className="template-desc">{tmpl.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="journal-editor">
            <div className="editor-header">
              <h3>
                {(() => {
                  const tmpl = JOURNAL_TEMPLATES.find(t => t.id === selectedTemplate);
                  return tmpl ? (lang === 'en' ? tmpl.labelEn : tmpl.labelId) : '';
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {JOURNAL_TEMPLATES.find(t => t.id === selectedTemplate)?.prompts.map((prompt, idx) => (
               <div key={idx} className="journal-prompt">
                 <label className="journal-prompt-label">{lang === 'en' ? prompt.en : prompt.id}</label>
               </div>
            ))}
            
            <textarea
              className="journal-content-input"
              placeholder={t('journal.contentPlaceholder', { defaultValue: 'Mulai menulis...' })}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            
            <button onClick={handleSave} className="btn-primary w-full mt-4">
              {t('common.save', { defaultValue: 'Simpan Jurnal' })}
            </button>
          </div>
        )}
      </section>

      <section className="journal-history">
        <h3>{t('journal.history', { defaultValue: 'Catatan Sebelumnya' })}</h3>
        {journals.map(journal => (
          <div key={journal.id} className="journal-entry-card">
            <div 
              onClick={() => setExpandedId(expandedId === journal.id ? null : journal.id)}
            >
              <h4 className="journal-entry-title">{journal.title}</h4>
              <div className="journal-entry-meta">
                <span className="journal-entry-date">{new Date(journal.date).toLocaleDateString()}</span>
              </div>
            </div>
            
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
    </div>
  );
};
