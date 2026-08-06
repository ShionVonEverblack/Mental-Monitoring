import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PenTool, Brain, Heart, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';

type TemplateType = 'freewrite' | 'cbt' | 'gratitude' | 'reflection';

const TEMPLATES = [
  { id: 'freewrite', icon: PenTool, name: 'Bebas Menulis', desc: 'Tuliskan apa saja yang ada di pikiranmu.' },
  { id: 'cbt', icon: Brain, name: 'Analisis Pikiran (CBT)', desc: 'Identifikasi dan ubah pola pikir negatif.' },
  { id: 'gratitude', icon: Heart, name: 'Jurnal Syukur', desc: 'Fokus pada hal-hal positif hari ini.' },
  { id: 'reflection', icon: Search, name: 'Refleksi Diri', desc: 'Pahami dirimu lebih dalam.' },
];

export const Journal: React.FC = () => {
  const { t } = useTranslation();
  const [journals, setJournals] = useLocalStorage<any[]>('rima-journals', []);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <div className="journal-page animate-fade-in-up">
      <header>
        <h1>{t('journal.title', { defaultValue: 'Jurnal' })}</h1>
      </header>

      <section className="templates-section">
        {!selectedTemplate ? (
          <div className="templates-grid">
            {TEMPLATES.map(tmpl => {
              const Icon = tmpl.icon;
              return (
                <Card 
                  key={tmpl.id} 
                  className="template-card interactive"
                  onClick={() => setSelectedTemplate(tmpl.id as TemplateType)}
                >
                  <Icon className="template-icon text-primary" size={28} />
                  <h3>{t(`journal.templates.${tmpl.id}.name`, { defaultValue: tmpl.name })}</h3>
                  <p>{t(`journal.templates.${tmpl.id}.desc`, { defaultValue: tmpl.desc })}</p>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="editor-card animate-fade-in">
            <div className="editor-header">
              <h3>{t(`journal.templates.${selectedTemplate}.name`, { defaultValue: TEMPLATES.find(t => t.id === selectedTemplate)?.name })}</h3>
              <button className="text-sm text-secondary" onClick={() => setSelectedTemplate(null)}>
                {t('common.cancel', { defaultValue: 'Batal' })}
              </button>
            </div>
            
            <input 
              type="text" 
              className="input-title"
              placeholder={t('journal.titlePlaceholder', { defaultValue: 'Judul jurnal...' })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <textarea
              className="input-content auto-grow"
              placeholder={t('journal.contentPlaceholder', { defaultValue: 'Mulai menulis...' })}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            
            <Button onClick={handleSave} className="w-full mt-4">
              {t('common.save', { defaultValue: 'Simpan Jurnal' })}
            </Button>
          </Card>
        )}
      </section>

      <section className="journal-history">
        <h3>{t('journal.history', { defaultValue: 'Catatan Sebelumnya' })}</h3>
        <div className="history-list">
          {journals.map(journal => (
            <Card key={journal.id} className="history-item">
              <div 
                className="history-header interactive"
                onClick={() => setExpandedId(expandedId === journal.id ? null : journal.id)}
              >
                <div>
                  <h4>{journal.title}</h4>
                  <div className="meta">
                    <span className="badge">{journal.template}</span>
                    <span className="date">{new Date(journal.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {expandedId === journal.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {expandedId === journal.id && (
                <div className="history-content animate-fade-in">
                  <p>{journal.content}</p>
                </div>
              )}
            </Card>
          ))}
          {journals.length === 0 && (
            <p className="empty-state">{t('journal.empty', { defaultValue: 'Belum ada catatan. Mulai menulis hari ini!' })}</p>
          )}
        </div>
      </section>
    </div>
  );
};
