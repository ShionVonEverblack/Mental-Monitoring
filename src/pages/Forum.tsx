import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Heart, Shield, Plus, Info } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FORUM_CATEGORIES } from '../utils/constants';

export const Forum: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useLocalStorage<any[]>('rima-forum-posts', []);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showGuidelines, setShowGuidelines] = useLocalStorage('rima-forum-guidelines-seen', false);
  const [isComposing, setIsComposing] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(FORUM_CATEGORIES[1].id);

  const handlePost = () => {
    if (!newTitle || !newContent) return;
    const post = {
      id: Date.now().toString(),
      author: `User${Math.floor(Math.random() * 1000)}`, // Anonymous placeholder
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
    <div className="forum-page animate-fade-in-up">
      <header className="flex-between">
        <h1>{t('forum.title', { defaultValue: 'Forum Dukungan' })}</h1>
        <Button variant="primary" size="sm" onClick={() => setIsComposing(true)}>
          <Plus size={16} /> {t('forum.newPost', { defaultValue: 'Tulis' })}
        </Button>
      </header>

      {!showGuidelines && (
        <Card className="guidelines-banner bg-accent-soft">
          <div className="flex items-start gap-3">
            <Info className="text-primary mt-1" size={24} />
            <div>
              <h3>{t('forum.guidelines.title', { defaultValue: 'Ruang Aman Bersama' })}</h3>
              <p>{t('forum.guidelines.desc', { defaultValue: 'Forum ini bersifat anonim. Harap jaga empati, saling menghargai, dan hindari konten pemicu (triggering) tanpa peringatan.' })}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowGuidelines(true)}>
                {t('common.understand', { defaultValue: 'Saya Mengerti' })}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="category-scroll hide-scrollbar">
        {FORUM_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {t(`forum.categories.${cat.id}`, { defaultValue: i18n.language === 'en' ? cat.labelEn : cat.labelId })}
          </button>
        ))}
      </div>

      {isComposing && (
        <Card className="compose-card animate-fade-in">
          <h3>{t('forum.composeTitle', { defaultValue: 'Buat Postingan Baru' })}</h3>
          <select 
            value={newCategory} 
            onChange={e => setNewCategory(e.target.value)}
            className="input-select"
          >
            {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{i18n.language === 'en' ? c.labelEn : c.labelId}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder={t('forum.postTitlePlaceholder', { defaultValue: 'Judul...' })}
            className="input-text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea 
            placeholder={t('forum.postContentPlaceholder', { defaultValue: 'Bagikan ceritamu...' })}
            className="input-textarea"
            rows={4}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="ghost" onClick={() => setIsComposing(false)}>
              {t('common.cancel', { defaultValue: 'Batal' })}
            </Button>
            <Button variant="primary" onClick={handlePost}>
              {t('forum.post', { defaultValue: 'Kirim' })}
            </Button>
          </div>
        </Card>
      )}

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <p className="empty-state">{t('forum.empty', { defaultValue: 'Belum ada postingan di kategori ini.' })}</p>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="avatar-circle small">{post.author.charAt(0)}</div>
                  <span className="author-name">{post.author}</span>
                  <span className="post-category badge">
                    {FORUM_CATEGORIES.find(c => c.id === post.categoryId) ? 
                      (i18n.language === 'en' ? FORUM_CATEGORIES.find(c => c.id === post.categoryId)!.labelEn : FORUM_CATEGORIES.find(c => c.id === post.categoryId)!.labelId) 
                      : ''}
                  </span>
                </div>
                <span className="post-time">{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
              <h4 className="post-title">{post.title}</h4>
              <p className="post-content-preview">{post.content}</p>
              
              <div className="post-actions">
                <button className="reaction-btn"><Heart size={16}/> {post.reactions.heart}</button>
                <button className="reaction-btn"><Shield size={16}/> {post.reactions.strength}</button>
                <button className="comment-btn"><MessageSquare size={16}/> {post.comments.length}</button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
