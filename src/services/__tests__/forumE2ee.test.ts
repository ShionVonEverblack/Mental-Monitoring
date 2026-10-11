import { describe, it, expect, beforeEach } from 'vitest';
import {
  createForumPost,
  fetchForumPosts,
  addCommentToPost,
  fetchPostComments,
  addReactionToPost,
  FORUM_E2EE_PASSPHRASE,
} from '../forumService';
import { decryptObject, isEncryptedPayload } from '../../utils/cryptoVault';

describe('Quiet Circles & Forum E2EE (Client-Side AES-GCM-256)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('encrypts post payload client-side before saving to storage', async () => {
    const rawTitle = 'Pikiran yang berat malam ini';
    const rawContent = 'Saya merasa sangat lelah dan butuh ruang aman untuk bercerita.';
    const author = 'Penjelajah Tenang';

    const { post } = await createForumPost(rawTitle, rawContent, 'anxiety', author);

    expect(post.isEncrypted).toBe(true);
    expect(post.encryptedPayload).toBeDefined();
    expect(isEncryptedPayload(post.encryptedPayload)).toBe(true);

    // Verify stored item in localStorage contains the encrypted ciphertext and MASKED plaintext (Zero-Knowledge)
    const rawStored = localStorage.getItem('rima-forum-posts');
    expect(rawStored).not.toBeNull();
    const storedPosts = JSON.parse(rawStored!);
    const target = storedPosts.find((p: { id: string }) => p.id === post.id);

    expect(target).toBeDefined();
    expect(target.encryptedPayload).toBeDefined();
    expect(target.encryptedPayload.ciphertext).toBeDefined();
    expect(typeof target.encryptedPayload.ciphertext).toBe('string');
    expect(target.encryptedPayload.ciphertext.length).toBeGreaterThan(0);

    // Critical Zero-Knowledge check: plaintext title & content must NOT be exposed in storage
    expect(target.title).toBe('[Terkunci E2EE]');
    expect(target.content).toBe('[Terkunci E2EE]');

    // Verify we can decrypt the payload with FORUM_E2EE_PASSPHRASE
    const decrypted = await decryptObject<{ title: string; content: string; authorName: string }>(
      FORUM_E2EE_PASSPHRASE,
      target.encryptedPayload
    );
    expect(decrypted.title).toBe(rawTitle);
    expect(decrypted.content).toBe(rawContent);
    expect(decrypted.authorName).toBe(author);
  });

  it('decrypts encrypted posts transparently when fetching posts via fetchForumPosts', async () => {
    await createForumPost(
      'Cerita Terenkripsi 1',
      'Isi cerita rahasia yang terenkripsi client side.',
      'self-care',
      'Sahabat Anonim'
    );

    const { posts } = await fetchForumPosts(0, 10);
    const found = posts.find((p) => p.title === 'Cerita Terenkripsi 1');

    expect(found).toBeDefined();
    expect(found?.content).toBe('Isi cerita rahasia yang terenkripsi client side.');
    expect(found?.authorName).toBe('Sahabat Anonim');
  });

  it('encrypts comment payloads client-side and decrypts them on fetch', async () => {
    const { post } = await createForumPost('Judul Post', 'Konten post', 'work', 'Penulis');

    const comment = await addCommentToPost(
      post.id,
      'Pesan pelukan hangat untukmu, kamu pasti bisa melewati ini.',
      'Teman Menemani'
    );

    expect(comment.isEncrypted).toBe(true);
    expect(comment.encryptedPayload).toBeDefined();
    expect(isEncryptedPayload(comment.encryptedPayload)).toBe(true);

    // Verify localStorage has encrypted payload and masked content
    const rawComments = localStorage.getItem('rima-forum-comments');
    expect(rawComments).not.toBeNull();
    const storedComments = JSON.parse(rawComments!);
    const storedComment = storedComments.find((c: { id: string }) => c.id === comment.id);
    expect(storedComment.encryptedPayload).toBeDefined();
    expect(storedComment.content).toBe('[Terkunci E2EE]');

    // Fetch comments and verify transparency
    const fetched = await fetchPostComments(post.id);
    expect(fetched.length).toBe(1);
    expect(fetched[0].content).toBe('Pesan pelukan hangat untukmu, kamu pasti bisa melewati ini.');
    expect(fetched[0].authorName).toBe('Teman Menemani');
  });

  it('supports empathetic warmth reactions (hug, heart, strength) without losing decrypted content', async () => {
    const { post } = await createForumPost('Tes Resonansi', 'Konten hangat', 'self-care');

    // Add empathetic hug reaction and verify returned posts remain decrypted
    const withHug = await addReactionToPost(post.id, 'hug');
    const hugPost = withHug.find((p) => p.id === post.id);
    expect(hugPost?.reactions.hug).toBe(1);
    expect(hugPost?.title).toBe('Tes Resonansi');
    expect(hugPost?.content).toBe('Konten hangat');

    // Add heart reaction
    const withHeart = await addReactionToPost(post.id, 'heart');
    const heartPost = withHeart.find((p) => p.id === post.id);
    expect(heartPost?.reactions.heart).toBe(1);
    expect(heartPost?.content).toBe('Konten hangat');

    // Add strength reaction
    const withStrength = await addReactionToPost(post.id, 'strength');
    const strengthPost = withStrength.find((p) => p.id === post.id);
    expect(strengthPost?.reactions.strength).toBe(1);
    expect(strengthPost?.content).toBe('Konten hangat');
  });

  it('handles corrupted or tampered E2EE payloads gracefully without crashing', async () => {
    // Inject a post with tampered ciphertext in localStorage
    const corruptedPost = {
      id: 'post-corrupted',
      authorName: 'Anonim',
      category: 'anxiety',
      title: '[Terkunci E2EE]',
      content: '[Terkunci E2EE]',
      reactions: { heart: 0, strength: 0, hug: 0 },
      commentCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      isEncrypted: true,
      encryptedPayload: {
        version: 1,
        salt: 'invalid-salt-base64!!!',
        iv: 'invalid-iv-base64!!!',
        ciphertext: 'corrupted-tampered-ciphertext==',
      },
    };
    localStorage.setItem('rima-forum-posts', JSON.stringify([corruptedPost]));

    // Fetching should NOT throw; should safely display fallback message
    const { posts } = await fetchForumPosts(0, 10);
    expect(posts.length).toBe(1);
    expect(posts[0].content).toBe('[Konten terenkripsi tidak dapat didekripsi]');

    // Inject corrupted comment
    const corruptedComment = {
      id: 'comment-corrupted',
      postId: 'post-corrupted',
      authorName: 'Anonim',
      content: '[Terkunci E2EE]',
      isSupportive: true,
      createdAt: new Date().toISOString(),
      isEncrypted: true,
      encryptedPayload: {
        version: 1,
        salt: 'invalid-salt-base64!!!',
        iv: 'invalid-iv-base64!!!',
        ciphertext: 'corrupted-tampered-ciphertext==',
      },
    };
    localStorage.setItem('rima-forum-comments', JSON.stringify([corruptedComment]));

    // Fetching comments should NOT throw; should safely display fallback message
    const comments = await fetchPostComments('post-corrupted');
    expect(comments.length).toBe(1);
    expect(comments[0].content).toBe('[Konten komentar terenkripsi tidak dapat didekripsi]');
  });
});
