import bcrypt from 'bcryptjs';
import { query } from './index.js';

export async function seedDatabase() {
  console.log('🌱 [CLANDESTINE Seed] Seeding demonstration database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const users = [
    {
      id: 'user-persona',
      username: 'Person A',
      email: 'persona@clandestine.internal',
      password_hash: passwordHash,
      avatar: 'PA',
      bio: 'Contributing author and researcher.',
      role: 'archivist'
    },
    {
      id: 'user-personb',
      username: 'Person B',
      email: 'personb@clandestine.internal',
      password_hash: passwordHash,
      avatar: 'PB',
      bio: 'Contributing author and researcher.',
      role: 'scholar'
    }
  ];

  for (const u of users) {
    const check = await query('SELECT id FROM users WHERE id = $1', [u.id]);
    if (check.rows.length === 0) {
      await query(
        'INSERT INTO users (id, username, email, password_hash, avatar, bio, role) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [u.id, u.username, u.email, u.password_hash, u.avatar, u.bio, u.role]
      );
    }
  }

  // 2. Seed Categories matching 3D Castle Wings
  const categories = [
    {
      id: 'cat-astronomy',
      name: 'Astronomy Wing',
      description: 'Cosmic mappings, stellar observations, and celestial mysteries of the high skies.',
      color: '#38BDF8',
      theme: 'observatory'
    },
    {
      id: 'cat-alchemy',
      name: 'Alchemy Chamber',
      description: 'Transmutations, potions, and forgotten elixirs connecting mind to matter.',
      color: '#34D399',
      theme: 'alchemical'
    },
    {
      id: 'cat-cathedral',
      name: 'Grand Cathedral',
      description: 'Architectural hymns, stone vaults, choral resonance, and sacred histories.',
      color: '#EAB308',
      theme: 'cathedral'
    },
    {
      id: 'cat-forbidden',
      name: 'Forbidden Archives',
      description: 'Restricted texts, dark philosophies, and ancient manuscripts sealed by wax.',
      color: '#A855F7',
      theme: 'forbidden'
    },
    {
      id: 'cat-crypt',
      name: 'Echoing Crypts',
      description: 'Subterranean catacombs, cold marble epitaphs, and echoes of fallen empires.',
      color: '#64748B',
      theme: 'crypt'
    },
    {
      id: 'cat-occult',
      name: 'Occult Laboratory',
      description: 'Spiritual inquiries, sigils, glowing crystals, and arcane experiments.',
      color: '#EF4444',
      theme: 'occult'
    },
    {
      id: 'cat-chronicles',
      name: 'Imperial Chronicles',
      description: 'Histories of emperors, dynastic treatises, and long centuries of scholarship.',
      color: '#F97316',
      theme: 'chronicles'
    },
    {
      id: 'cat-scriptorium',
      name: 'The Scriptorium',
      description: 'Craft of parchment, quill calligraphy, editorial debate, and literary reflections.',
      color: '#E2E8F0',
      theme: 'scriptorium'
    }
  ];

  for (const cat of categories) {
    const check = await query('SELECT id FROM categories WHERE id = $1', [cat.id]);
    if (check.rows.length === 0) {
      await query(
        'INSERT INTO categories (id, name, description, color, theme) VALUES ($1, $2, $3, $4, $5)',
        [cat.id, cat.name, cat.description, cat.color, cat.theme]
      );
    }
  }

  // 3. Seed 4 Real Demonstration Articles (Posts)
  const posts = [
    {
      id: 'post-vaults',
      user_id: 'user-persona',
      category_id: 'cat-cathedral',
      title: 'The Architecture of Whispers: Acoustic Secrets of the Grand Vaults',
      subtitle: 'How medieval stone masonry captured and modulated spoken thoughts across centuries.',
      content: `Wandering through the high nave at twilight, one discovers that the gothic ribs do not merely bear the weight of immense granite blocks—they function as an acoustic lens. When a speaker stands precisely on the crossing dais, a whisper spoken toward the eastern clerestory does not dissipate into the shadows. Instead, it rides the curve of the pointed archway and descends into the opposite transept with crystal precision.

This phenomenon was neither an accident nor an ornament. Medieval monastic builders engineered these spaces to conduct philosophical dialogues without disturbing silent meditation. In our modern rush toward noisy feeds and loud declarations, there is a profound discipline in spaces constructed to amplify the subtle and honor quiet concentration. Perhaps the digital archives we design today should learn from stone and vaulting: not all words need to be screamed across the kingdom to carry eternal weight.`,
      tags: ['Architecture', 'Cathedral', 'Acoustics', 'Philosophy'],
      reading_time: '4 min read'
    },
    {
      id: 'post-alchemy',
      user_id: 'user-personb',
      category_id: 'cat-alchemy',
      title: 'Transmuting Thought: Reflections on Modern Digital Arcana',
      subtitle: 'The parallels between ancient distillation of mercury and modern synthesis of ideas.',
      content: `The ancient practitioners of alchemy did not seek physical gold merely to line the coffers of kings; that was the preoccupation of fools. The true Opus Magnum was the purification of base perception into refined consciousness through three stages: the blackening of doubt, the whitening of clarity, and the reddening of integrated truth.

When we examine the craft of writing and blogging today, we practice the exact same alchemy. Raw experiences, fragmented notes, and disparate reading materials are placed into the alembic of the mind. Under the flame of persistent inquiry, the trivial evaporates, leaving behind a distilled essence capable of illuminating other minds. To write is to transmute leaden thought into incandescent gold.`,
      tags: ['Alchemy', 'Metaphor', 'WritingCraft', 'Transmutation'],
      reading_time: '5 min read'
    },
    {
      id: 'post-astronomy',
      user_id: 'user-persona',
      category_id: 'cat-astronomy',
      title: 'Celestial Drift: Observations on Stellar Cartography and Isolation',
      subtitle: 'From the highest parapet, the stars do not offer answers; they demand better questions.',
      content: `Night after night at the astrolabe, the brass rings turn with the slow creak of aged metal. When aligning the sights with the constellation of the Weaver, one is reminded of how deceptive distance can be. Two stars that appear to rest within a hairsbreadth in the night sky may be separated by ten thousand light cycles of empty abyss.

Scholarship possesses a similar paradox. We work in solitary towers, surrounded by candlelight and dry ink, feeling profoundly alone with our inquiries. Yet the moment our thoughts are committed to manuscript and discovered by another reader in a different century or distant land, that illusion of isolation collapses. We are stars caught in the same celestial web, conversing across unfathomable distances.`,
      tags: ['Astronomy', 'Cosmology', 'Solitude', 'Perspective'],
      reading_time: '6 min read'
    },
    {
      id: 'post-forbidden',
      user_id: 'user-personb',
      category_id: 'cat-forbidden',
      title: 'The Geometry of Forbidden Knowledge: Why Some Books Must Remain Closed',
      subtitle: 'An inquiry into cognitive hazard, intellectual humility, and the seal of caution.',
      content: `In the subterranean chambers where the iron grates remain padlocked, certain manuscripts are bound in brass chains. The popular myth claims these tomes hold curses or summoning circles. The truth, as any seasoned scholar knows, is far more subtle and dangerous.

Some ideas cannot be understood safely without the prerequisite temperance to hold them. Just as high-voltage currents destroy fragile conduits unsuited for their transmission, certain raw truths dismantle minds unprepared for paradoxical reality. The ancient seal was never about censorship—it was about pacing. Wisdom is knowledge tempered by patience and ethical responsibility.`,
      tags: ['ForbiddenArchives', 'Epistemology', 'Wisdom', 'Philosophy'],
      reading_time: '5 min read'
    }
  ];

  for (const p of posts) {
    const check = await query('SELECT id FROM posts WHERE id = $1', [p.id]);
    if (check.rows.length === 0) {
      await query(
        'INSERT INTO posts (id, user_id, category_id, title, subtitle, content, tags, reading_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [p.id, p.user_id, p.category_id, p.title, p.subtitle, p.content, p.tags, p.reading_time]
      );
    }
  }

  // 4. Seed Real Comments (Marginal Notes)
  const comments = [
    {
      id: 'comm-1',
      post_id: 'post-vaults',
      user_id: 'user-personb',
      content: 'The acoustic comparison is remarkable. Have you measured the reverberation decay in the northern crypts as well?',
      parent_id: null
    },
    {
      id: 'comm-2',
      post_id: 'post-vaults',
      user_id: 'user-persona',
      content: 'Indeed, Person B. The decay lasts approximately 4.8 seconds, creating an overtone harmony with the eastern bells.',
      parent_id: 'comm-1'
    },
    {
      id: 'comm-3',
      post_id: 'post-alchemy',
      user_id: 'user-persona',
      content: 'The tripartite division (nigredo, albedo, rubedo) fits the editing process of long-form manuscripts remarkably well.',
      parent_id: null
    }
  ];

  for (const c of comments) {
    const check = await query('SELECT id FROM comments WHERE id = $1', [c.id]);
    if (check.rows.length === 0) {
      await query(
        'INSERT INTO comments (id, post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4, $5)',
        [c.id, c.post_id, c.user_id, c.content, c.parent_id]
      );
    }
  }

  console.log('✅ [CLANDESTINE Seed] Seeding completed successfully.');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
