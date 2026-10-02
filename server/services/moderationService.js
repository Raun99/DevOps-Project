// CLANDESTINE Comment Moderation Service (Enhanced)
// Analyzes marginal notes/comments for prohibited words, harassment, leetspeak evasion, and spam

const PROHIBITED_WORDS = [
  'spam',
  'scam',
  'malware',
  'phishing',
  'offensive',
  'vulgar',
  'curseword',
  'exploit',
  'hack',
  'pyramid',
  'crypto_drainer'
];

const SUSPICIOUS_DOMAINS = [
  '.xyz',
  '.top',
  '.click',
  '.ru',
  '.link',
  'bit.ly',
  'tinyurl.com'
];

/**
 * Normalizes leetspeak and symbol substitution to catch evasive profanity/spam
 * @param {string} text 
 * @returns {string}
 */
function normalizeLeetspeak(text) {
  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[\$5]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[\+]/g, 't')
    .replace(/[^a-z0-9\s]/g, '');
}

/**
 * Sanitizes dangerous HTML or script tags from user comments
 * @param {string} text 
 * @returns {string}
 */
function sanitizeInput(text) {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '');
}

/**
 * Validates whether comment content adheres to archive scholarly standards.
 * @param {string} content 
 * @returns {{ allowed: boolean, reason?: string, sanitized?: string }}
 */
export function validateCommentContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      allowed: false,
      reason: 'Comment text cannot be empty.'
    };
  }

  const trimmed = content.trim();

  if (trimmed.length < 2) {
    return {
      allowed: false,
      reason: 'Comment must be at least 2 characters long.'
    };
  }

  if (trimmed.length > 2000) {
    return {
      allowed: false,
      reason: 'Comment cannot exceed 2000 characters.'
    };
  }

  // 1. Check for malicious code or script tags
  if (/<script\b/i.test(trimmed) || /javascript:/i.test(trimmed) || /<iframe\b/i.test(trimmed)) {
    return {
      allowed: false,
      reason: 'Script or executable markup detected. Comments may only contain plain scholarly prose.'
    };
  }

  // 2. Check for spam links and suspicious top-level domains
  const lower = trimmed.toLowerCase();
  for (const domain of SUSPICIOUS_DOMAINS) {
    if (lower.includes(domain)) {
      return {
        allowed: false,
        reason: `Comment contains flagged link pattern (${domain}). Outside links require archive clearance.`
      };
    }
  }

  // Count links
  const urlMatches = trimmed.match(/https?:\/\//gi);
  if (urlMatches && urlMatches.length > 2) {
    return {
      allowed: false,
      reason: 'Comment contains excessive hyperlinks (maximum 2 permitted per marginal note).'
    };
  }

  // 3. Check for prohibited terms with word boundary detection
  for (const word of PROHIBITED_WORDS) {
    const wordBoundaryRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (wordBoundaryRegex.test(trimmed)) {
      return {
        allowed: false,
        reason: `Comment contains prohibited term: "${word}". Please observe scholarly decorum.`
      };
    }
  }

  // 4. Check normalized leetspeak to catch obfuscated violations
  const normalized = normalizeLeetspeak(trimmed);
  const words = normalized.split(/\s+/);
  for (const word of PROHIBITED_WORDS) {
    if (words.includes(word)) {
      return {
        allowed: false,
        reason: `Comment contains obfuscated prohibited term: "${word}". Scholarly decorum is required.`
      };
    }
  }

  // Return sanitized clean prose
  return {
    allowed: true,
    sanitized: sanitizeInput(trimmed)
  };
}

export default {
  validateCommentContent
};
