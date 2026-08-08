import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FORUM_CATEGORIES } from '../utils/constants';
import type { ForumCategory } from '../types';

export const Forum: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useLocalStorage<any[]>('rima-forum-posts', []);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showGuidelines, setShowGuidelines] = useLocalStorage('rima-forum-guidelines-seen', false);
  const [isComposing, setIsComposing] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumCategory>(FORUM_CATEGORIES[1].id);

  const lang = i18n.language as 'id' | 'en';

  const handlePost = () => {
    if (!newTitle || !newContent) return;
    const post = {
      id: Date.now().toString(),
      author: `User${Math.floor(Math.random() * 1000)}`,
      title: newTitle,
      content: newContent,
      categoryId: newCategory,
      timestamp: new Date().toISOString(),
      reactions: { heart: 0, strength: 0, hug: 0 },
      comments: []
    };
    setPosts([post, ...posts]);
    setIsComposing(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.categoryId === activeCategory);

  return (
    <div className="forum-page">
      <header className="forum-header">
        <h1 className="page-title">{t('forum.title', { defaultValue: 'Forum Dukungan' })}</h1>
        <p className="forum-subtitle">{t('forum.subtitle', { defaultValue: 'Ruang aman untuk berbagi.' })}</p>
        <button className="btn-primary" onClick={() => setIsComposing(true)}>
          {t('forum.newPost', { defaultValue: 'Tulis' })}
        </button>
      </header>

      {!showGuidelines && (
        <div className="guidelines-banner">
          <h3>{t('forum.guidelines.title', { defaultValue: 'Ruang Aman Bersama' })}</h3>
          <p>{t('forum.guidelines.desc', { defaultValue: 'Forum ini bersifat anonim. Harap jaga empati.' })}</p>
          <button className="btn-ghost" onClick={() => setShowGuidelines(true)}>
            {t('common.understand', { defaultValue: 'Saya Mengerti' })}
          </button>
        </div>
      )}

      <div className="category-chips">
        <button
          className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          {t('forum.allCategories', { defaultValue: 'Semua' })}
        </button>
        {FORUM_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {lang === 'en' ? cat.labelEn : cat.labelId}
          </button>
        ))}
      </div>

      {isComposing && (
        <div className="forum-post-card">
          <h3>{t('forum.composeTitle', { defaultValue: 'Buat Postingan Baru' })}</h3>
          <select 
            value={newCategory} 
            onChange={e => setNewCategory(e.target.value as ForumCategory)}
            style={{ width: '100%', padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}
          >
            {FORUM_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{lang === 'en' ? c.labelEn : c.labelId}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder={t('forum.postTitlePlaceholder', { defaultValue: 'Judul...' })}
            style={{ width: '100%', padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea 
            placeholder={t('forum.postContentPlaceholder', { defaultValue: 'Bagikan ceritamu...' })}
            style={{ width: '100%', padding: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}
            rows={4}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setIsComposing(false)}>
              {t('common.cancel', { defaultValue: 'Batal' })}
            </button>
            <button className="btn-primary" onClick={handlePost}>
              {t('forum.post', { defaultValue: 'Kirim' })}
            </button>
          </div>
        </div>
      )}

      <div className="forum-posts">
        {filteredPosts.length === 0 ? (
          <div className="forum-empty">
            <div className="forum-empty-icon">💬</div>
            <p>{t('forum.empty', { defaultValue: 'Belum ada postingan di kategori ini.' })}</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="forum-post-card">
              <div className="forum-post-header">
                <div className="forum-post-avatar">{post.author.charAt(0)}</div>
                <span className="forum-post-author">{post.author}</span>
                <span className="forum-post-time">{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
              <h4 className="forum-post-title">{post.title}</h4>
              <p className="forum-post-content">{post.content}</p>
              
              <div className="forum-post-footer">
                <button className="forum-reaction">❤️ {post.reactions.heart}</button>
                <button className="forum-reaction">🛡️ {post.reactions.strength}</button>
                <button className="forum-reaction">💬 {post.comments.length}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
