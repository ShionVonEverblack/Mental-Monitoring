import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FORUM_CATEGORIES } from '../utils/constants';
import type { ForumCategory, ForumPost, ForumComment } from '../types';
import {
  fetchForumPosts,
  createForumPost,
  addReactionToPost,
  fetchPostComments,
  addCommentToPost,
  checkCrisisKeywords
} from '../services/forumService';
import { generateAnonymousName } from '../utils/helpers';
import { ShieldAlert, MessageCircle, AlertTriangle, Send, Phone, CheckCircle, Flag } from 'lucide-react';

export const Forum: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showGuidelines, setShowGuidelines] = useState<boolean>(
    !localStorage.getItem('rima-forum-guidelines-seen')
  );
  const [isComposing, setIsComposing] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumCategory>('anxiety');
  const [anonymousAuthor, setAnonymousAuthor] = useState(() => generateAnonymousName());

  // Crisis detection state
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);

  // Expanded post for comments
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, ForumComment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lang = i18n.language as 'id' | 'en';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await fetchForumPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    checkCrisis(val, newContent);
  };

  const handleContentChange = (val: string) => {
    setNewContent(val);
    checkCrisis(newTitle, val);
  };

  const checkCrisis = (title: string, content: string) => {
    const crisis = checkCrisisKeywords(title) || checkCrisisKeywords(content);
    setIsCrisisDetected(crisis);
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { isCrisis } = await createForumPost(
        newTitle.trim(),
        newContent.trim(),
        newCategory,
        anonymousAuthor
      );
      if (isCrisis) {
        triggerToast(t('forum.crisisPostAlert', 'Postingan terdeteksi berisi kata sensitif. Bantuan krisis selalu tersedia untukmu.'));
      } else {
        triggerToast(t('forum.postSuccess', 'Postingan anonim berhasil dipublikasikan!'));
      }
      setIsComposing(false);
      setNewTitle('');
      setNewContent('');
      setAnonymousAuthor(generateAnonymousName());
      setIsCrisisDetected(false);
      loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      triggerToast(t('common.error', 'Terjadi kesalahan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, type: 'heart' | 'strength' | 'hug') => {
    try {
      const updated = await addReactionToPost(postId, type);
      setPosts(updated);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      try {
        const comments = await fetchPostComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    try {
      const comment = await addCommentToPost(postId, newCommentText.trim());
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      setNewCommentText('');
      triggerToast(t('forum.commentSent', 'Dukunganmu telah terkirim!'));
      loadPosts();
    } catch (error) {
      console.error('Failed to add comment:', error);
      triggerToast(t('common.error', 'Terjadi kesalahan'));
    }
  };

  const handleReportPost = () => {
    triggerToast(t('forum.reportSent', 'Laporan telah diterima. Tim moderasi akan meninjau postingan ini.'));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const dismissGuidelines = () => {
    localStorage.setItem('rima-forum-guidelines-seen', 'true');
    setShowGuidelines(false);
  };

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="forum-page">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border-strong)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle size={18} style={{ color: 'var(--color-secondary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="forum-header">
        <div>
          <h1 className="page-title">{t('forum.title', { defaultValue: 'Forum Komunitas Anonim' })}</h1>
          <p className="forum-subtitle">{t('forum.subtitle', { defaultValue: 'Ruang aman tanpa penghakiman. Saling mendengar dan mendukung.' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsComposing(prev => !prev)}>
          {isComposing ? t('common.cancel', 'Batal') : t('forum.newPost', 'Tulis Cerita')}
        </button>
      </header>

      {showGuidelines && (
        <div className="guidelines-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-primary)' }} />
            <strong>{t('forum.guidelinesTitle', 'Pedoman Komunitas Aman')}</strong>
          </div>
          <p>{t('forum.guidelinesText', 'Identitasmu terlindungi (anonim). Berbicaralah dengan penuh empati, saling menguatkan, dan hindari kata-kata kebencian.')}</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }} onClick={dismissGuidelines}>
            {t('common.understand', 'Saya Mengerti')}
          </button>
        </div>
      )}

      <div className="category-chips">
        <button
          className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          {t('forum.all', 'Semua')} ({posts.length})
        </button>
        {FORUM_CATEGORIES.map(cat => {
          const count = posts.filter(p => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {lang === 'en' ? cat.labelEn : cat.labelId} ({count})
            </button>
          );
        })}
      </div>

      {isComposing && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', animation: 'scaleIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('forum.newPostTitle', 'Tulis Cerita Anonim')}
            </h3>
            <span style={{ fontSize: '0.813rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {t('forum.postingAs', 'Sebagai:')} {anonymousAuthor}
            </span>
          </div>

          {isCrisisDetected && (
            <div style={{
              backgroundColor: 'hsla(0, 65%, 55%, 0.12)',
              border: '1px solid var(--color-danger)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontWeight: 700 }}>
                <AlertTriangle size={20} />
                <span>{t('forum.crisisTitle', 'Kami peduli padamu. Kamu tidak sendirian.')}</span>
              </div>
              <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('forum.crisisBody', 'Jika kamu merasa sangat berat atau memikirkan hal-hal berbahaya, silakan hubungi Layanan Krisis Into The Light sekarang:')}
              </p>
              <a href="tel:119,8" className="btn btn-danger btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content', marginTop: '4px' }}>
                <Phone size={14} /> {t('forum.crisisCall', 'Telepon 119 ext 8')}
              </a>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select
              className="select"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as ForumCategory)}
            >
              {FORUM_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{lang === 'en' ? c.labelEn : c.labelId}</option>
              ))}
            </select>

            <input
              type="text"
              className="input"
              placeholder={t('forum.titlePlaceholder', 'Judul cerita atau pertanyaanmu...')}
              value={newTitle}
              onChange={e => handleTitleChange(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder={t('forum.contentPlaceholder', 'Ceritakan apa yang sedang kamu rasakan. Ini ruang amanmu...')}
              rows={4}
              value={newContent}
              onChange={e => handleContentChange(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setIsComposing(false)}>
                {t('common.cancel', 'Batal')}
              </button>
              <button className="btn btn-primary" onClick={handlePost} disabled={isSubmitting}>
                {t('forum.submit', 'Kirim Cerita')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="forum-posts">
        {filteredPosts.length === 0 ? (
          <div className="forum-empty">
            <div className="forum-empty-icon">💬</div>
            <p>{t('forum.empty', 'Belum ada cerita di kategori ini. Jadilah yang pertama berbagi.')}</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isExpanded = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div key={post.id} className="forum-post-card">
                <div className="forum-post-header">
                  <div className="forum-post-avatar" style={{ backgroundColor: 'hsla(215, 65%, 55%, 0.15)', color: 'var(--color-primary)' }}>
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="forum-post-author">{post.authorName}</span>
                    <span className="badge badge-primary" style={{ marginLeft: '8px' }}>
                      {FORUM_CATEGORIES.find(c => c.id === post.category)?.[lang === 'en' ? 'labelEn' : 'labelId'] || post.category}
                    </span>
                  </div>
                  <span className="forum-post-time">
                    {new Date(post.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}
                  </span>
                </div>

                <h2 className="forum-post-title">{post.title}</h2>
                <p className="forum-post-content" style={{ WebkitLineClamp: isExpanded ? 'unset' : 3 }}>
                  {post.content}
                </p>

                <div className="forum-post-footer">
                  <button className="forum-reaction" onClick={() => handleReaction(post.id, 'heart')}>
                    ❤️ {post.reactions?.heart || 0}
                  </button>
                  <button className="forum-reaction" onClick={() => handleReaction(post.id, 'strength')}>
                    💪 {post.reactions?.strength || 0}
                  </button>
                  <button className="forum-reaction" onClick={() => handleReaction(post.id, 'hug')}>
                    🤗 {post.reactions?.hug || 0}
                  </button>

                  <button className="forum-reaction" onClick={() => toggleComments(post.id)} style={{ marginLeft: 'auto' }}>
                    <MessageCircle size={14} /> {post.commentCount || 0} {t('forum.comments', 'Komentar')}
                  </button>

                  <button className="btn btn-ghost btn-sm" onClick={handleReportPost} title={t('forum.reportPost', 'Laporkan Postingan')}>
                    <Flag size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {t('forum.peerSupport', 'Dukungan Sesama')} ({comments.length})
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {comments.map(comment => (
                        <div key={comment.id} style={{ padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.813rem' }}>
                              {comment.authorName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          {t('forum.noComments', 'Belum ada pesan dukungan. Jadilah yang pertama memberikan semangat!')}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder={t('forum.replyPlaceholder', 'Tulis pesan dukungan hangat...')}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(post.id)}>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
