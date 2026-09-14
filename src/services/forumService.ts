import type { ForumPost, ForumComment, ForumCategory } from '../types';
import { generateId, generateAnonymousName } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from './supabase';

import { detectCrisis } from './crisisDetectionService';

// Unified crisis check — delegates to centralized crisisDetectionService
// (Previously had a separate CRISIS_KEYWORDS array here causing desync)
export function checkCrisisKeywords(text: string): boolean {
  return detectCrisis(text).isDetected;
}

const LOCAL_STORAGE_KEY = 'rima-forum-posts';
const LOCAL_COMMENTS_KEY = 'rima-forum-comments';

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
  if (isSupabaseConfigured && supabase) {
    try {
      // First attempt query on the hardened public view (hiding is_flagged)
      const from = page * limit;
      const to = from + limit - 1;
      
      let { data, error } = await supabase
        .from('forum_posts_public')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // Fallback if view hasn't been migrated yet
      if (error) {
        const fallback = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        const posts: ForumPost[] = data.map(item => ({
          id: item.id,
          authorName: item.author_name,
          category: item.category as ForumCategory,
          title: item.title,
          content: item.content,
          reactions: item.reactions || { heart: 0, strength: 0, hug: 0 },
          commentCount: item.comment_count || 0,
          isFlagged: false, // Hidden for user privacy
          createdAt: item.created_at
        }));
        return {
          posts,
          hasMore: data.length === limit,
        };
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  // Local storage fallback
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let allPosts: ForumPost[] = DEFAULT_POSTS;
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  } else {
    try {
      allPosts = JSON.parse(raw);
    } catch {
      allPosts = DEFAULT_POSTS;
    }
  }

  const from = page * limit;
  const paginated = allPosts.slice(from, from + limit);
  return {
    posts: paginated,
    hasMore: from + limit < allPosts.length,
    total: allPosts.length
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

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('forum_posts').insert([{
        id: newPost.id,
        author_name: newPost.authorName,
        category: newPost.category,
        title: newPost.title,
        content: newPost.content,
        reactions: newPost.reactions,
        comment_count: 0,
        is_flagged: newPost.isFlagged
      }]);
    } catch (e) {
      console.warn('Failed to insert post into Supabase:', e);
    }
  }

  // Update local storage
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let existing: ForumPost[] = [];
  try {
    existing = raw ? JSON.parse(raw) : DEFAULT_POSTS;
  } catch {
    existing = DEFAULT_POSTS;
  }
  const updated = [newPost, ...existing];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('local-storage'));

  return { post: newPost, isCrisis, severity: crisisResult.severity };
}

export async function addReactionToPost(postId: string, reactionType: 'heart' | 'strength' | 'hug'): Promise<ForumPost[]> {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  let posts: ForumPost[] = [];
  try {
    posts = raw ? JSON.parse(raw) : DEFAULT_POSTS;
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

  if (isSupabaseConfigured && supabase) {
    const target = updated.find(p => p.id === postId);
    if (target) {
      supabase
        .from('forum_posts')
        .update({ reactions: target.reactions })
        .eq('id', postId)
        .then(() => {}, err => console.warn('Supabase sync failed:', err));
    }
  }

  return updated;
}

export async function fetchPostComments(postId: string): Promise<ForumComment[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          postId: item.post_id,
          authorName: item.author_name,
          content: item.content,
          isSupportive: item.is_supportive,
          createdAt: item.created_at
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch comments failed:', e);
    }
  }

  const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
  let allComments: ForumComment[] = [];
  try {
    allComments = raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('Failed to parse comments from localStorage');
  }
  return allComments.filter(c => c.postId === postId);
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

  const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
  let allComments: ForumComment[] = [];
  try {
    allComments = raw ? JSON.parse(raw) : [];
  } catch {
    console.warn('Failed to parse comments from localStorage');
  }
  const updatedComments = [...allComments, newComment];
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(updatedComments));

  // Update comment count on post
  const rawPosts = localStorage.getItem(LOCAL_STORAGE_KEY);
  let posts: ForumPost[] = [];
  try {
    posts = rawPosts ? JSON.parse(rawPosts) : DEFAULT_POSTS;
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

  if (isSupabaseConfigured && supabase) {
    supabase.from('forum_comments').insert([{
      id: newComment.id,
      post_id: postId,
      author_name: newComment.authorName,
      content: newComment.content,
      is_supportive: newComment.isSupportive
    }]).then(() => {}, err => console.warn('Supabase comment insert failed:', err));

    supabase.from('forum_posts')
      .update({ comment_count: updatedPosts.find(p => p.id === postId)?.commentCount || 1 })
      .eq('id', postId)
      .then(() => {}, err => console.warn('Supabase comment count update failed:', err));
  }

  return newComment;
}
