import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchForumPosts,
  createForumPost,
  addReactionToPost,
  fetchPostComments,
  addCommentToPost,
  isPostBookmarked,
  toggleBookmarkPost,
  reportForumPost,
  getReportedPostIds
} from '../forumService';

describe('forumService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates normal forum posts with isFlagged=false', async () => {
    const { post, isCrisis } = await createForumPost(
      'Hari yang tenang',
      'Hari ini saya mencoba jalan santai di taman dan merasa lebih rileks.',
      'self-care',
      'Anonim'
    );

    expect(isCrisis).toBe(false);
    expect(post.isFlagged).toBe(false);
    expect(post.title).toBe('Hari yang tenang');
  });

  it('detects crisis keywords and flags the post (isFlagged=true)', async () => {
    const { post, isCrisis, severity } = await createForumPost(
      'Sudah tidak kuat lagi',
      'Aku merasa ingin bunuh diri dan mengakhiri semuanya malam ini',
      'depression',
      'Anonim'
    );

    expect(isCrisis).toBe(true);
    expect(post.isFlagged).toBe(true);
    expect(['severe', 'critical']).toContain(severity);
  });

  it('filters out flagged posts from public fetchForumPosts to prevent moderation leaks', async () => {
    // Create one normal post
    await createForumPost(
      'Post Aman',
      'Cerita hari ini yang positif dan penuh harapan.',
      'self-care',
      'User Aman'
    );

    // Create one flagged crisis post
    await createForumPost(
      'Post Krisis Bahaya',
      'Aku mau bunuh diri sekarang tolong',
      'depression',
      'User Krisis'
    );

    const { posts } = await fetchForumPosts(0, 50);

    // Verify all returned posts are NOT flagged
    expect(posts.some(p => p.title === 'Post Aman')).toBe(true);
    expect(posts.some(p => p.title === 'Post Krisis Bahaya')).toBe(false);
    expect(posts.every(p => !p.isFlagged)).toBe(true);
  });

  it('adds reactions to posts correctly', async () => {
    const { post } = await createForumPost('Tes Reaksi', 'Konten tes reaksi', 'other');
    const initialHeart = post.reactions.heart;

    const updatedPosts = await addReactionToPost(post.id, 'heart');
    const target = updatedPosts.find(p => p.id === post.id);

    expect(target?.reactions.heart).toBe(initialHeart + 1);
  });

  it('adds and fetches comments for a post', async () => {
    const { post } = await createForumPost('Tes Komentar', 'Konten post', 'anxiety');
    const comment = await addCommentToPost(post.id, 'Semangat ya, kamu tidak sendirian!', 'Teman');

    expect(comment.postId).toBe(post.id);
    expect(comment.content).toBe('Semangat ya, kamu tidak sendirian!');

    const comments = await fetchPostComments(post.id);
    expect(comments.some(c => c.id === comment.id)).toBe(true);
  });

  it('toggles bookmarks and reports posts', async () => {
    const postId = 'test-post-id-123';
    expect(isPostBookmarked(postId)).toBe(false);

    toggleBookmarkPost(postId);
    expect(isPostBookmarked(postId)).toBe(true);

    toggleBookmarkPost(postId);
    expect(isPostBookmarked(postId)).toBe(false);

    await reportForumPost(postId, 'spam', 'Konten tidak relevan');
    const reportedIds = getReportedPostIds();
    expect(reportedIds).toContain(postId);

    await reportForumPost('post-456', 'harassment');
    expect(getReportedPostIds()).toEqual(expect.arrayContaining([postId, 'post-456']));
  });

  it('recovers gracefully when forum storage keys contain malformed non-array objects', async () => {
    localStorage.setItem('rima_forum_posts', JSON.stringify({ corrupted: true }));
    localStorage.setItem('rima_forum_comments', JSON.stringify({ corrupted: true }));
    localStorage.setItem('rima_bookmarked_posts', JSON.stringify({ corrupted: true }));

    const { posts } = await fetchForumPosts(0, 10);
    expect(Array.isArray(posts)).toBe(true);

    const comments = await fetchPostComments('any-post-id');
    expect(Array.isArray(comments)).toBe(true);
    expect(comments).toEqual([]);

    expect(isPostBookmarked('any-post-id')).toBe(false);
  });

  it('handles malformed objects in localStorage gracefully across create, react, and report', async () => {
    localStorage.setItem('rima-forum-posts', JSON.stringify({ malformed: true }));
    localStorage.setItem('rima-forum-reports', JSON.stringify({ malformed: true }));

    // createForumPost should not throw on malformed storage
    const created = await createForumPost('Judul', 'Konten', 'other');
    expect(created.post).toBeDefined();

    // addReactionToPost should not throw on malformed storage
    const reacted = await addReactionToPost(created.post.id, 'heart');
    expect(Array.isArray(reacted)).toBe(true);

    // getReportedPostIds should not throw on malformed storage
    const reports = getReportedPostIds();
    expect(Array.isArray(reports)).toBe(true);
    expect(reports).toEqual([]);

    // reportForumPost should not throw on malformed storage
    await reportForumPost('post-abc', 'spam');
    const updatedReports = getReportedPostIds();
    expect(updatedReports).toContain('post-abc');
  });
});
