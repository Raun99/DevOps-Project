import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if PostgreSQL is available
let pool = null;
let useFallback = false;

// In-memory data store for resilient fallback when PostgreSQL is not running locally
const fallbackStore = {
  users: [],
  categories: [],
  posts: [],
  comments: [],
  likes: [],
  bookmarks: []
};

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2000
    });
  }
} catch (err) {
  console.warn('⚠️ [Database] Failed to initialize pg.Pool. Using in-memory fallback store.', err.message);
  useFallback = true;
}

// SQL In-memory query simulator for resilient fallback
function simulateQuery(sqlText, params = []) {
  const normalized = sqlText.trim().replace(/\s+/g, ' ');

  // SELECT queries
  if (normalized.toUpperCase().startsWith('SELECT')) {
    if (normalized.includes('FROM users WHERE id = $1')) {
      const user = fallbackStore.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (normalized.includes('FROM users WHERE email = $1')) {
      const user = fallbackStore.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (normalized.includes('FROM users WHERE username = $1')) {
      const user = fallbackStore.users.find(u => u.username === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (normalized.includes('FROM categories')) {
      if (normalized.includes('WHERE id = $1')) {
        const cat = fallbackStore.categories.find(c => c.id === params[0]);
        return { rows: cat ? [cat] : [], rowCount: cat ? 1 : 0 };
      }
      if (normalized.includes('WHERE name = $1')) {
        const cat = fallbackStore.categories.find(c => c.name.toLowerCase() === params[0].toLowerCase());
        return { rows: cat ? [cat] : [], rowCount: cat ? 1 : 0 };
      }
      return { rows: [...fallbackStore.categories], rowCount: fallbackStore.categories.length };
    }
    if (normalized.includes('FROM posts')) {
      let filtered = [...fallbackStore.posts];
      
      // Detailed join with user and category
      const enrich = (p) => {
        const user = fallbackStore.users.find(u => u.id === p.user_id) || {};
        const cat = fallbackStore.categories.find(c => c.id === p.category_id) || {};
        return {
          ...p,
          author_username: user.username || 'Archivist Scribe',
          author_avatar: user.avatar || 'AS',
          author_bio: user.bio || '',
          category_name: cat.name || 'General',
          category_color: cat.color || '#38bdf8',
          category_theme: cat.theme || 'arcane'
        };
      };

      if (normalized.includes('WHERE posts.id = $1') || normalized.includes('WHERE id = $1') || normalized.includes('p.id = $1')) {
        const post = fallbackStore.posts.find(p => p.id === params[0]);
        return { rows: post ? [enrich(post)] : [], rowCount: post ? 1 : 0 };
      }

      if (normalized.includes('WHERE p.category_id = $1') || normalized.includes('WHERE category_id = $1')) {
        filtered = filtered.filter(p => p.category_id === params[0]);
      } else if (normalized.includes('WHERE p.user_id = $1') || normalized.includes('WHERE user_id = $1')) {
        filtered = filtered.filter(p => p.user_id === params[0]);
      }

      const rows = filtered.map(enrich);
      return { rows, rowCount: rows.length };
    }
    if (normalized.includes('FROM comments')) {
      if (normalized.includes('WHERE post_id = $1') || normalized.includes('WHERE c.post_id = $1')) {
        const comments = fallbackStore.comments
          .filter(c => c.post_id === params[0])
          .map(c => {
            const user = fallbackStore.users.find(u => u.id === c.user_id) || {};
            return {
              ...c,
              author_username: user.username || 'Scholar',
              author_avatar: user.avatar || 'SC'
            };
          });
        return { rows: comments, rowCount: comments.length };
      }
      if (normalized.includes('WHERE id = $1') || normalized.includes('WHERE c.id = $1')) {
        const c = fallbackStore.comments.find(item => item.id === params[0]);
        return { rows: c ? [c] : [], rowCount: c ? 1 : 0 };
      }
      return { rows: [...fallbackStore.comments], rowCount: fallbackStore.comments.length };
    }
    if (normalized.includes('FROM likes')) {
      if (normalized.includes('WHERE user_id = $1 AND post_id = $2')) {
        const exists = fallbackStore.likes.some(l => l.user_id === params[0] && l.post_id === params[1]);
        return { rows: exists ? [{ user_id: params[0], post_id: params[1] }] : [], rowCount: exists ? 1 : 0 };
      }
      if (normalized.includes('WHERE user_id = $1')) {
        const userLikes = fallbackStore.likes.filter(l => l.user_id === params[0]);
        return { rows: userLikes, rowCount: userLikes.length };
      }
    }
    if (normalized.includes('FROM bookmarks')) {
      if (normalized.includes('WHERE user_id = $1 AND post_id = $2')) {
        const exists = fallbackStore.bookmarks.some(b => b.user_id === params[0] && b.post_id === params[1]);
        return { rows: exists ? [{ user_id: params[0], post_id: params[1] }] : [], rowCount: exists ? 1 : 0 };
      }
      if (normalized.includes('WHERE b.user_id = $1') || normalized.includes('WHERE user_id = $1')) {
        const userBookmarks = fallbackStore.bookmarks.filter(b => b.user_id === params[0]);
        return { rows: userBookmarks, rowCount: userBookmarks.length };
      }
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT queries
  if (normalized.toUpperCase().startsWith('INSERT INTO')) {
    if (normalized.includes('INSERT INTO users')) {
      const [id, username, email, password_hash, avatar, bio, role] = params;
      const newUser = {
        id,
        username,
        email,
        password_hash,
        avatar: avatar || 'SC',
        bio: bio || 'Scholar of the Imperial Observatory',
        role: role || 'scholar',
        created_at: new Date().toISOString()
      };
      fallbackStore.users.push(newUser);
      return { rows: [newUser], rowCount: 1 };
    }
    if (normalized.includes('INSERT INTO categories')) {
      const [id, name, description, color, theme] = params;
      const newCat = {
        id,
        name,
        description: description || '',
        color: color || '#38BDF8',
        theme: theme || 'arcane',
        created_at: new Date().toISOString()
      };
      fallbackStore.categories.push(newCat);
      return { rows: [newCat], rowCount: 1 };
    }
    if (normalized.includes('INSERT INTO posts')) {
      const [id, user_id, category_id, title, subtitle, content, tags, reading_time] = params;
      const newPost = {
        id,
        user_id,
        category_id,
        title,
        subtitle: subtitle || '',
        content,
        tags: Array.isArray(tags) ? tags : [],
        reading_time: reading_time || '5 min read',
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackStore.posts.unshift(newPost);
      return { rows: [newPost], rowCount: 1 };
    }
    if (normalized.includes('INSERT INTO comments')) {
      const [id, post_id, user_id, content, parent_id] = params;
      const newComment = {
        id,
        post_id,
        user_id,
        content,
        parent_id: parent_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackStore.comments.push(newComment);
      return { rows: [newComment], rowCount: 1 };
    }
    if (normalized.includes('INSERT INTO likes')) {
      const [user_id, post_id] = params;
      if (!fallbackStore.likes.some(l => l.user_id === user_id && l.post_id === post_id)) {
        fallbackStore.likes.push({ user_id, post_id, created_at: new Date().toISOString() });
        const post = fallbackStore.posts.find(p => p.id === post_id);
        if (post) post.likes_count = (post.likes_count || 0) + 1;
      }
      return { rows: [{ user_id, post_id }], rowCount: 1 };
    }
    if (normalized.includes('INSERT INTO bookmarks')) {
      const [user_id, post_id] = params;
      if (!fallbackStore.bookmarks.some(b => b.user_id === user_id && b.post_id === post_id)) {
        fallbackStore.bookmarks.push({ user_id, post_id, created_at: new Date().toISOString() });
      }
      return { rows: [{ user_id, post_id }], rowCount: 1 };
    }
  }

  // UPDATE queries
  if (normalized.toUpperCase().startsWith('UPDATE')) {
    if (normalized.includes('UPDATE posts')) {
      // SET title = $1, subtitle = $2, content = $3, category_id = $4, tags = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6
      const [title, subtitle, content, category_id, tags, id] = params;
      const post = fallbackStore.posts.find(p => p.id === id);
      if (post) {
        if (title !== undefined) post.title = title;
        if (subtitle !== undefined) post.subtitle = subtitle;
        if (content !== undefined) post.content = content;
        if (category_id !== undefined) post.category_id = category_id;
        if (tags !== undefined) post.tags = tags;
        post.updated_at = new Date().toISOString();
        return { rows: [post], rowCount: 1 };
      }
    }
    if (normalized.includes('UPDATE users')) {
      // SET username = $1, bio = $2, avatar = $3 WHERE id = $4
      const [username, bio, avatar, id] = params;
      const user = fallbackStore.users.find(u => u.id === id);
      if (user) {
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (avatar) user.avatar = avatar;
        return { rows: [user], rowCount: 1 };
      }
    }
  }

  // DELETE queries
  if (normalized.toUpperCase().startsWith('DELETE')) {
    if (normalized.includes('FROM posts WHERE id = $1')) {
      const idx = fallbackStore.posts.findIndex(p => p.id === params[0]);
      if (idx !== -1) {
        const deleted = fallbackStore.posts.splice(idx, 1);
        return { rows: deleted, rowCount: 1 };
      }
    }
    if (normalized.includes('FROM comments WHERE id = $1')) {
      const idx = fallbackStore.comments.findIndex(c => c.id === params[0]);
      if (idx !== -1) {
        const deleted = fallbackStore.comments.splice(idx, 1);
        return { rows: deleted, rowCount: 1 };
      }
    }
    if (normalized.includes('FROM likes WHERE user_id = $1 AND post_id = $2')) {
      const idx = fallbackStore.likes.findIndex(l => l.user_id === params[0] && l.post_id === params[1]);
      if (idx !== -1) {
        fallbackStore.likes.splice(idx, 1);
        const post = fallbackStore.posts.find(p => p.id === params[1]);
        if (post) post.likes_count = Math.max(0, (post.likes_count || 1) - 1);
        return { rows: [], rowCount: 1 };
      }
    }
    if (normalized.includes('FROM bookmarks WHERE user_id = $1 AND post_id = $2')) {
      const idx = fallbackStore.bookmarks.findIndex(b => b.user_id === params[0] && b.post_id === params[1]);
      if (idx !== -1) {
        fallbackStore.bookmarks.splice(idx, 1);
        return { rows: [], rowCount: 1 };
      }
    }
  }

  return { rows: [], rowCount: 0 };
}

// Unified query runner with transparent fallback
export async function query(text, params) {
  if (pool && !useFallback) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('⚠️ [Database] Pool query failed, switching to in-memory fallback:', err.message);
      useFallback = true;
      return simulateQuery(text, params);
    }
  }
  return simulateQuery(text, params);
}

export function isUsingFallback() {
  return useFallback || !pool;
}

export { pool, fallbackStore };
