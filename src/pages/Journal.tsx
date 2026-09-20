import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JOURNAL_TEMPLATES, COGNITIVE_DISTORTIONS } from '../utils/constants';
import type { JournalTemplate, JournalEntry, CbtThoughtRecord } from '../types';
import { CbtWizard } from '../components/journal/CbtWizard';
import { detectCrisis } from '../services/crisisDetectionService';
import { Modal } from '../components/ui/Modal';
import type { CrisisDetectionResult } from '../services/crisisDetectionService';
import { formatDate } from '../utils/helpers';

export const Journal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [journals, setJournals] = useLocalStorage<JournalEntry[]>('rima-journals', []);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingJournalId, setDeletingJournalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [crisisResult, setCrisisResult] = useState<CrisisDetectionResult | null>(null);

  const lang = i18n.language?.split('-')[0] || 'id';

  const handleStartEdit = (journal: JournalEntry) => {
    setEditingId(journal.id);
    setTitle(journal.title);
    setContent(journal.content);
    setSelectedTemplate(journal.template);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditor = () => {
    setSelectedTemplate(null);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const editingJournal = journals.find(j => j.id === editingId);

  const handleSaveCbt = (payload: { title: string; content: string; cbtRecord: CbtThoughtRecord }) => {
    const now = new Date().toISOString();

    if (editingId) {
      setJournals(prev => prev.map(j => {
        if (j.id === editingId) {
          return {
            ...j,
            title: payload.title,
            content: payload.content,
            template: 'cbt',
            cbtRecord: payload.cbtRecord,
            updatedAt: now,
          };
        }
        return j;
      }));
      setEditingId(null);
    } else {
      const newJournal: JournalEntry = {
        id: Date.now().toString(),
        title: payload.title,
        content: payload.content,
        template: 'cbt',
        cbtRecord: payload.cbtRecord,
        isPrivate: false,
        createdAt: now,
        updatedAt: now,
      };
      setJournals(prev => [newJournal, ...prev]);
    }

    setSelectedTemplate(null);
    setTitle('');
    setContent('');

    const result = detectCrisis(payload.content);
    if (result.isDetected) {
      setCrisisResult(result);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const now = new Date().toISOString();

    if (editingId) {
      setJournals(prev => prev.map(j => {
        if (j.id === editingId) {
          return {
            ...j,
            title: title.trim(),
            content: content.trim(),
            template: selectedTemplate || j.template,
            updatedAt: now,
          };
        }
        return j;
      }));
      setEditingId(null);
    } else {
      const newJournal: JournalEntry = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        template: selectedTemplate || 'free',
        isPrivate: false,
        createdAt: now,
        updatedAt: now,
      };
      setJournals(prev => [newJournal, ...prev]);
    }

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
        ) : selectedTemplate === 'cbt' ? (
          <CbtWizard
            initialData={editingJournal?.cbtRecord}
            initialTitle={editingJournal?.title}
            onSave={handleSaveCbt}
            onCancel={handleCancelEditor}
          />
        ) : (
          <div className="journal-editor">
            <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                {editingId
                  ? t('journal.editTitle', 'Edit Jurnal')
                  : (() => {
                      const tmpl = JOURNAL_TEMPLATES.find(t => t.id === selectedTemplate);
                      return tmpl ? t(`journal.templates.${tmpl.id}`, lang === 'en' ? tmpl.labelEn : tmpl.labelId) : '';
                    })()}
              </h3>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={handleCancelEditor}
              >
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
              {editingId
                ? t('journal.update', 'Perbarui Jurnal')
                : t('common.save', { defaultValue: 'Simpan Jurnal' })}
            </button>
          </div>
        )}
      </section>

      <section className="journal-history">
        <h3>{t('journal.history', { defaultValue: 'Catatan Sebelumnya' })}</h3>
        {journals.map(journal => (
          <div key={journal.id} className="journal-entry-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button"
                className="journal-entry-toggle"
                onClick={() => setExpandedId(expandedId === journal.id ? null : journal.id)}
                aria-expanded={expandedId === journal.id}
                style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-sm) 0' }}
              >
                <h4 className="journal-entry-title">{journal.title}</h4>
                <div className="journal-entry-meta">
                  <span className="journal-entry-date">{formatDate(journal.createdAt, lang)}</span>
                </div>
              </button>
              <div style={{ display: 'flex', gap: '4px', paddingLeft: '8px' }}>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => handleStartEdit(journal)}
                  aria-label={t('common.edit', 'Edit')}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  onClick={() => setDeletingJournalId(journal.id)}
                  aria-label={t('common.delete', 'Hapus')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {expandedId === journal.id ? (
              <div className="journal-entry-preview">
                {journal.cbtRecord ? (
                  <div className="journal-cbt-summary">
                    <div className="journal-cbt-header">
                      <span className="journal-cbt-intensity-pill">
                        {t('cbt.initialIntensityLabel', 'Intensitas:')} {journal.cbtRecord.initialIntensity}/10 ➔ {journal.cbtRecord.finalIntensity}/10
                      </span>
                    </div>

                    {journal.cbtRecord.distortions.length > 0 && (
                      <div className="journal-cbt-distortions">
                        {journal.cbtRecord.distortions.map(distId => {
                          const distortion = COGNITIVE_DISTORTIONS.find(d => d.id === distId);
                          return (
                            <span key={distId} className="journal-cbt-distortion-badge">
                              {distortion ? `${distortion.icon} ${t(distortion.nameKey, distortion.nameFallback)}` : distId}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {journal.cbtRecord.balancedThought && (
                      <div className="journal-cbt-balanced-box">
                        <label>{t('cbt.balancedLabel', 'Pikiran Seimbang Baru:')}</label>
                        <p>"{journal.cbtRecord.balancedThought}"</p>
                      </div>
                    )}

                    <details className="journal-cbt-details">
                      <summary>{t('cbt.viewFullDetails', 'Lihat Rekam Analisis Lengkap')}</summary>
                      <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{journal.content}</p>
                    </details>
                  </div>
                ) : (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{journal.content}</p>
                )}
              </div>
            ) : null}
          </div>
        ))}
        {journals.length === 0 && (
          <p>{t('journal.empty', { defaultValue: 'Belum ada catatan. Mulai menulis hari ini!' })}</p>
        )}
      </section>

      {deletingJournalId && (
        <Modal
          isOpen={!!deletingJournalId}
          onClose={() => setDeletingJournalId(null)}
          title={t('common.deleteConfirmTitle', 'Konfirmasi Hapus')}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: 1.5 }}>
            {t('journal.deleteConfirm', 'Apakah kamu yakin ingin menghapus catatan jurnal ini?')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeletingJournalId(null)}
            >
              {t('common.cancel', 'Batal')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (deletingJournalId) {
                  setJournals(prev => prev.filter(j => j.id !== deletingJournalId));
                  if (editingId === deletingJournalId) {
                    handleCancelEditor();
                  }
                  setDeletingJournalId(null);
                }
              }}
            >
              {t('common.delete', 'Hapus')}
            </button>
          </div>
        </Modal>
      )}

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
