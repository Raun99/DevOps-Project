// CLANDESTINE Profanity & Content Safety Filter Service
// Provides genuine profanity detection across post titles, subtitles, content, and comments

const PROFANE_WORDS = [
  // Profanities and obscenities
  'fuck',
  'fucker',
  'fucking',
  'fucked',
  'shit',
  'shitting',
  'bullshit',
  'bitch',
  'bitches',
  'bitching',
  'asshole',
  'bastard',
  'bastards',
  'cunt',
  'cunts',
  'dick',
  'dicks',
  'dickhead',
  'pussy',
  'pussies',
  'cock',
  'cocks',
  'motherfucker',
  'motherfucking',
  'whore',
  'whores',
  'slut',
  'sluts',
  'douche',
  'douchebag',
  'wanker',
  'twat',
  'jackass',
  // Common slurs
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'retard',
  'retarded',
  'kike',
  'chink',
  'spic'
];

/**
 * Normalizes leetspeak, punctuation obfuscation, and repeated characters
 * @param {string} text 
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[\$5]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[\+]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[\s\-_.*]+/g, ' ') // Collapse spaced characters
    .trim();
}

/**
 * Checks if a given text string contains profanity with word-boundary awareness
 * to eliminate false positives (e.g. "classic", "document", "bass").
 * 
 * @param {string} text 
 * @returns {{ isProfane: boolean, word?: string, reason?: string }}
 */
export function checkProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { isProfane: false };
  }

  const raw = text.toLowerCase();
  const normalized = normalizeText(text);

  // Check 1: Exact word boundaries in raw text
  for (const word of PROFANE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(raw)) {
      return {
        isProfane: true,
        word,
        reason: `Inappropriate or profane language detected: "${word}".`
      };
    }
  }

  // Check 2: Word boundaries in normalized leetspeak
  for (const word of PROFANE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isProfane: true,
        word,
        reason: `Obfuscated profane language detected: "${word}".`
      };
    }
  }

  // Check 3: Collapsed space/punctuation patterns like "f u c k" or "s.h.i.t"
  const stripped = raw.replace(/[^a-z]/g, '');
  for (const word of PROFANE_WORDS) {
    // Only test words of length 4+ to prevent false positives on stripped text
    if (word.length >= 4 && stripped.includes(word)) {
      // Double check it's not a harmless substring like "assume" or "bass"
      const harmlessWords = ['classic', 'class', 'assume', 'passage', 'compass', 'asset', 'document'];
      const isHarmless = harmlessWords.some(h => raw.includes(h));
      if (!isHarmless) {
        return {
          isProfane: true,
          word,
          reason: `Concealed profane language detected: "${word}".`
        };
      }
    }
  }

  return { isProfane: false };
}

/**
 * Validates post submission or edit fields
 * @param {{ title?: string, subtitle?: string, content?: string }} fields 
 * @returns {{ valid: boolean, error?: string, field?: string }}
 */
export function validatePostContent({ title, subtitle, content }) {
  if (title) {
    const check = checkProfanity(title);
    if (check.isProfane) {
      return {
        valid: false,
        field: 'title',
        error: `Post title contains prohibited language. Please revise.`
      };
    }
  }

  if (subtitle) {
    const check = checkProfanity(subtitle);
    if (check.isProfane) {
      return {
        valid: false,
        field: 'subtitle',
        error: `Post subtitle contains prohibited language. Please revise.`
      };
    }
  }

  if (content) {
    const check = checkProfanity(content);
    if (check.isProfane) {
      return {
        valid: false,
        field: 'content',
        error: `Post content contains prohibited language. Please revise.`
      };
    }
  }

  return { valid: true };
}

export default {
  checkProfanity,
  validatePostContent,
  normalizeText
};
