import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FC } from 'react';
import { EDUCATION_ARTICLES, EDUCATION_CATEGORIES } from '../data/educationContent';

export const Education: FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'id';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return EDUCATION_ARTICLES.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const title = lang === 'en' ? article.titleEn : article.titleId;
      const summary = lang === 'en' ? article.summaryEn : article.summaryId;
      const matchesSearch = title.toLowerCase().includes(searchLower) || summary.toLowerCase().includes(searchLower);
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, lang]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
    ));
  };

  return (
    <div className="education-page">
      <header>
        <h1>{t('education.title', 'Edukasi Kesehatan Mental')}</h1>
        <p>{t('education.subtitle', 'Pelajari tentang kesehatan mentalmu')}</p>
      </header>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <input 
          type="text" 
          className="input" 
          placeholder={t('education.search', 'Cari artikel...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px', width: '100%' }}
        />
      </div>
      
      <div className="education-categories">
        {EDUCATION_CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            className={`chip ${selectedCategory === cat.id ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {lang === 'en' ? cat.labelEn : cat.labelId}
          </button>
        ))}
      </div>
      
      <div className="education-articles">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div className="education-card" key={article.id}>
              <button 
                className="education-card-header" 
                onClick={() => toggleExpand(article.id)}
                aria-expanded={expandedId === article.id}
              >
                <span className="education-card-icon">{article.icon}</span>
                <div className="education-card-info">
                  <h3>{lang === 'en' ? article.titleEn : article.titleId}</h3>
                  <p>{lang === 'en' ? article.summaryEn : article.summaryId}</p>
                </div>
                <span className="education-card-meta">{article.readingTimeMinutes} min</span>
              </button>
              
              {expandedId === article.id && (
                <div className="education-card-content">
                  {renderContent(lang === 'en' ? article.contentEn : article.contentId)}
                  <p className="education-source">
                    {t('education.source', 'Sumber')}: {article.source}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
            {t('education.noResults', 'Tidak ada artikel yang ditemukan.')}
          </p>
        )}
      </div>
    </div>
  );
};
