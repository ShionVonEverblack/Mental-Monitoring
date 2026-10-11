import type { ForumPost, ForumComment, ForumCategory } from '../types';
import { generateId, generateAnonymousName } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabase';
import { isNetworkAllowed } from '../stores/dualModeStore';

import { detectCrisis } from './crisisDetectionService';
import { encryptObject, decryptObject } from '../utils/cryptoVault';

export const FORUM_E2EE_PASSPHRASE = 'rima-quiet-circles-e2ee-v1';

// Unified crisis check — delegates to centralized crisisDetectionService
// (Previously had a separate CRISIS_KEYWORDS array here causing desync)
export function checkCrisisKeywords(text: string): boolean {
  return detectCrisis(text).isDetected;
}

const LOCAL_STORAGE_KEY = 'rima-forum-posts';
const LOCAL_COMMENTS_KEY = 'rima-forum-comments';
const LOCAL_REPORTS_KEY = 'rima-forum-reports';
const LOCAL_BOOKMARKS_KEY = 'rima-forum-bookmarks';

export const DEFAULT_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorName: 'Brave Butterfly',
    category: 'anxiety',
    title: 'Merasa cemas tanpa alasan menjelang malam',
    content: 'Apakah ada yang sering merasa cemas atau deg-degan saat malam hari tiba? Bagaimana cara kalian menenangkannya?',
    reactions: { heart: 12, strength: 8, hug: 15 },
    commentCount: 3,
    isFlagged: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'post-2',
    authorName: 'Calm Wave',
    category: 'self-care',
    title: 'Kemajuan kecil hari ini: Akhirnya jalan pagi 15 menit',
    content: 'Setelah seminggu cuma di kamar, hari ini saya paksakan keluar rumah untuk napas udara segar. Rasanya lega banget.',
    reactions: { heart: 24, strength: 19, hug: 10 },
    commentCount: 5,
    isFlagged: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'post-3',
    authorName: 'Gentle Breeze',
    category: 'work',
    title: 'Burnout di pekerjaan tapi takut mau resign',
    content: 'Beban kerja makin tidak masuk akal, tapi ekonomi lagi susah. Adakah yang punya saran bagaimana menjaga mental tetap stabil?',
    reactions: { heart: 9, strength: 14, hug: 7 },
    commentCount: 2,
    isFlagged: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];



export interface PaginatedPosts {
  posts: ForumPost[];
  hasMore: boolean;
  total?: number;
}

export async function fetchForumPosts(page = 0, limit = 20): Promise<PaginatedPosts> {
  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    try {
      // First attempt query on the hardened public view (hiding is_flagged)
      const from = page * limit;
      const to = from + limit - 1;
      
      let { data, error } = await supabase
        .from('forum_posts_public')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // Fallback if view hasn't been migrated yet (strictly query unflagged posts)
      if (error) {
        const fallback = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact' })
          .eq('is_flagged', false)
          .order('created_at', { ascending: false })
          .range(from, to);
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        const posts: ForumPost[] = await Promise.all(
          data.map(async item => {
            const basePost: ForumPost = {
              id: item.id,
              authorName: item.author_name,
              category: item.category as ForumCategory,
              title: item.title,
              content: item.content,
              reactions: item.reactions || { heart: 0, strength: 0, hug: 0 },
              commentCount: item.comment_count || 0,
              isFlagged: false, // Filtered and hidden for user privacy & safety
              createdAt: item.created_at,
              encryptedPayload: item.encrypted_payload || item.encryptedPayload,
              isEncrypted: item.is_encrypted || item.isEncrypted,
            };
            if (basePost.encryptedPayload) {
              try {
                const dec = await decryptObject<{ title: string; content: string; authorName?: string }>(
                  FORUM_E2EE_PASSPHRASE,
                  basePost.encryptedPayload
                );
                if (dec.title) basePost.title = dec.title;
                if (dec.content) basePost.content = dec.content;
                if (dec.authorName) basePost.authorName = dec.authorName;
              } catch {
                basePost.content = '[Konten terenkripsi tidak dapat didekripsi]';
              }
            }
            return basePost;
          })
        );
        return {
          posts,
          hasMore: data.length === limit,
        };
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  // Local storage fallback (strictly exclude flagged posts from community view)
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let allPosts: ForumPost[] = DEFAULT_POSTS;
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  } else {
    try {
      const parsed = JSON.parse(raw);
      allPosts = Array.isArray(parsed) ? parsed : DEFAULT_POSTS;
    } catch {
      allPosts = DEFAULT_POSTS;
    }
  }

  const visiblePosts = allPosts.filter(p => !p.isFlagged);
  const from = page * limit;
  const paginated = visiblePosts.slice(from, from + limit);
  const decryptedPosts = await Promise.all(
    paginated.map(async (p) => {
      if (p.encryptedPayload) {
        try {
          const dec = await decryptObject<{ title: string; content: string; authorName?: string }>(
            FORUM_E2EE_PASSPHRASE,
            p.encryptedPayload
          );
          return {
            ...p,
            title: dec.title || p.title,
            content: dec.content || p.content,
            authorName: dec.authorName || p.authorName,
          };
        } catch {
          return {
            ...p,
            content: '[Konten terenkripsi tidak dapat didekripsi]',
          };
        }
      }
      return p;
    })
  );

  return {
    posts: decryptedPosts,
    hasMore: from + limit < visiblePosts.length,
    total: visiblePosts.length
  };
}


export async function createForumPost(
  title: string,
  content: string,
  category: ForumCategory,
  authorName?: string
): Promise<{ post: ForumPost; isCrisis: boolean; severity: string }> {
  const crisisResult = detectCrisis(`${title} ${content}`);
  const isCrisis = crisisResult.isDetected;
  const newPost: ForumPost = {
    id: generateId(),
    authorName: authorName || generateAnonymousName(),
    category,
    title,
    content,
    reactions: { heart: 0, strength: 0, hug: 0 },
    commentCount: 0,
    isFlagged: isCrisis,
    createdAt: new Date().toISOString(),
  };

  try {
    const encryptedPayload = await encryptObject(FORUM_E2EE_PASSPHRASE, {
      title,
      content,
      authorName: newPost.authorName,
    });
    newPost.encryptedPayload = encryptedPayload;
    newPost.isEncrypted = true;
  } catch (err) {
    console.warn('Failed to encrypt forum post payload client-side:', err);
  }

  // Zero-Knowledge Persistence:
  // When encrypted, mask plaintext fields in persistent storage & cloud sync
  const storedPost: ForumPost = {
    ...newPost,
    title: newPost.isEncrypted ? '[Terkunci E2EE]' : newPost.title,
    content: newPost.isEncrypted ? '[Terkunci E2EE]' : newPost.content,
  };

  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    try {
      await supabase.from('forum_posts').insert([{
        id: storedPost.id,
        author_name: storedPost.authorName,
        category: storedPost.category,
        title: newPost.title,
        content: storedPost.content,
        reactions: storedPost.reactions,
        comment_count: 0,
        is_flagged: storedPost.isFlagged,
        encrypted_payload: storedPost.encryptedPayload,
        is_encrypted: storedPost.isEncrypted,
      }]);
    } catch (e) {
      console.warn('Failed to insert post into Supabase:', e);
    }
  }

  // Update local storage with zero-knowledge masked post
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let existing: ForumPost[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : DEFAULT_POSTS;
    existing = Array.isArray(parsed) ? parsed : DEFAULT_POSTS;
  } catch {
    existing = DEFAULT_POSTS;
  }
  const updated = [storedPost, ...existing];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('local-storage'));

  return { post: newPost, isCrisis, severity: crisisResult.severity };
}

export async function addReactionToPost(postId: string, reactionType: 'heart' | 'strength' | 'hug'): Promise<ForumPost[]> {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let posts: ForumPost[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : DEFAULT_POSTS;
    posts = Array.isArray(parsed) ? parsed : DEFAULT_POSTS;
  } catch {
    posts = DEFAULT_POSTS;
  }
  const updated = posts.map(p => {
    if (p.id === postId) {
      const currentCount = p.reactions[reactionType] || 0;
      return {
        ...p,
        reactions: {
          ...p.reactions,
          [reactionType]: currentCount + 1
        }
      };
    }
    return p;
  });

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('local-storage'));

  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    const target = updated.find(p => p.id === postId);
    if (target) {
      Promise.resolve(
        supabase
          .from('forum_posts')
          .update({ reactions: target.reactions })
          .eq('id', postId)
      ).catch((err: unknown) => console.warn('Supabase sync failed:', err));
    }
  }

  // Decrypt posts transparently so the caller UI receives readable text
  const decryptedPosts = await Promise.all(
    updated.map(async (p) => {
      if (p.encryptedPayload) {
        try {
          const dec = await decryptObject<{ title: string; content: string; authorName?: string }>(
            FORUM_E2EE_PASSPHRASE,
            p.encryptedPayload
          );
          return {
            ...p,
            title: dec.title || p.title,
            content: dec.content || p.content,
            authorName: dec.authorName || p.authorName,
          };
        } catch {
          return {
            ...p,
            content: '[Konten terenkripsi tidak dapat didekripsi]',
          };
        }
      }
      return p;
    })
  );

  return decryptedPosts;
}

export async function fetchPostComments(postId: string): Promise<ForumComment[]> {
  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return await Promise.all(
          data.map(async item => {
            const comment: ForumComment = {
              id: item.id,
              postId: item.post_id,
              authorName: item.author_name,
              content: item.content,
              isSupportive: item.is_supportive,
              createdAt: item.created_at,
              encryptedPayload: item.encrypted_payload || item.encryptedPayload,
              isEncrypted: item.is_encrypted || item.isEncrypted,
            };
            if (comment.encryptedPayload) {
              try {
                const dec = await decryptObject<{ content: string; authorName?: string }>(
                  FORUM_E2EE_PASSPHRASE,
                  comment.encryptedPayload
                );
                if (dec.content) comment.content = dec.content;
                if (dec.authorName) comment.authorName = dec.authorName;
              } catch {
                comment.content = '[Konten komentar terenkripsi tidak dapat didekripsi]';
              }
            }
            return comment;
          })
        );
      }
    } catch (e) {
      console.warn('Supabase fetch comments failed:', e);
    }
  }

  const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
  let allComments: ForumComment[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    allComments = Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Failed to parse comments from localStorage');
  }

  const filtered = allComments.filter(c => c.postId === postId);
  return await Promise.all(
    filtered.map(async c => {
      if (c.encryptedPayload) {
        try {
          const dec = await decryptObject<{ content: string; authorName?: string }>(
            FORUM_E2EE_PASSPHRASE,
            c.encryptedPayload
          );
          return {
            ...c,
            content: dec.content || c.content,
            authorName: dec.authorName || c.authorName,
          };
        } catch {
          return {
            ...c,
            content: '[Konten komentar terenkripsi tidak dapat didekripsi]',
          };
        }
      }
      return c;
    })
  );
}

export async function addCommentToPost(postId: string, content: string, authorName?: string): Promise<ForumComment> {
  const newComment: ForumComment = {
    id: generateId(),
    postId,
    authorName: authorName || generateAnonymousName(),
    content,
    isSupportive: true,
    createdAt: new Date().toISOString(),
  };

  try {
    const encryptedPayload = await encryptObject(FORUM_E2EE_PASSPHRASE, {
      content,
      authorName: newComment.authorName,
    });
    newComment.encryptedPayload = encryptedPayload;
    newComment.isEncrypted = true;
  } catch (err) {
    console.warn('Failed to encrypt comment payload client-side:', err);
  }

  // Zero-Knowledge Persistence:
  // When encrypted, mask plaintext comment content in persistent storage & cloud sync
  const storedComment: ForumComment = {
    ...newComment,
    content: newComment.isEncrypted ? '[Terkunci E2EE]' : newComment.content,
  };

  const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
  let allComments: ForumComment[] = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    allComments = Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('Failed to parse comments from localStorage');
  }
  const updatedComments = [...allComments, storedComment];
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(updatedComments));

  // Update comment count on post
  const rawPosts = localStorage.getItem(LOCAL_STORAGE_KEY);
  let posts: ForumPost[] = [];
  try {
    const parsed = rawPosts ? JSON.parse(rawPosts) : DEFAULT_POSTS;
    posts = Array.isArray(parsed) ? parsed : DEFAULT_POSTS;
  } catch {
    posts = DEFAULT_POSTS;
  }
  const updatedPosts = posts.map(p => {
    if (p.id === postId) {
      return { ...p, commentCount: p.commentCount + 1 };
    }
    return p;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
  window.dispatchEvent(new Event('local-storage'));

  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    Promise.resolve(
      supabase.from('forum_comments').insert([{
        id: storedComment.id,
        post_id: postId,
        author_name: storedComment.authorName,
        content: storedComment.content,
        is_supportive: storedComment.isSupportive,
        encrypted_payload: storedComment.encryptedPayload,
        is_encrypted: storedComment.isEncrypted,
      }])
    ).catch((err: unknown) => console.warn('Supabase comment insert failed:', err));

    Promise.resolve(
      supabase.from('forum_posts')
        .update({ comment_count: updatedPosts.find(p => p.id === postId)?.commentCount || 1 })
        .eq('id', postId)
      ).catch((err: unknown) => console.warn('Supabase comment count update failed:', err));
  }

  return newComment;
}

export function getBookmarkedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isPostBookmarked(postId: string): boolean {
  return getBookmarkedPostIds().includes(postId);
}

export function toggleBookmarkPost(postId: string): string[] {
  const current = getBookmarkedPostIds();
  const exists = current.includes(postId);
  const updated = exists
    ? current.filter(id => id !== postId)
    : [...current, postId];

  localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('local-storage'));
  return updated;
}

export interface ForumReport {
  id: string;
  postId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export function getReportedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const reports: ForumReport[] = Array.isArray(parsed) ? parsed : [];
    return reports.map(r => r.postId);
  } catch {
    return [];
  }
}

export async function reportForumPost(postId: string, reason: string, details?: string): Promise<void> {
  const newReport: ForumReport = {
    id: generateId(),
    postId,
    reason,
    details,
    createdAt: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const current: ForumReport[] = Array.isArray(parsed) ? parsed : [];
    const updated = [...current, newReport];
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('local-storage'));
  } catch (err) {
    console.warn('Failed to save forum report locally:', err);
  }

  // Attempt sync with Supabase moderation table if configured and network allowed
  if (isNetworkAllowed() && isSupabaseConfigured && supabase) {
    try {
      await supabase.from('forum_reports').insert([{
        id: newReport.id,
        post_id: postId,
        reason,
        details: details || '',
        created_at: newReport.createdAt
      }]);
    } catch (e) {
      console.warn('Failed to send forum report to Supabase:', e);
    }
  }
}
