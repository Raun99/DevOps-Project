// CLANDESTINE Comment Moderation Service
// Analyzes marginal notes/comments for prohibited words, harassment, and spam

const PROHIBITED_WORDS = [
  'spam',
  'scam',
  'malware',
  'phishing',
  'offensive',
  'vulgar',
  'curseword'
];

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

  const lower = trimmed.toLowerCase();
  for (const word of PROHIBITED_WORDS) {
    if (lower.includes(word)) {
      return {
        allowed: false,
        reason: `Comment contains prohibited term: "${word}". Please observe scholarly decorum.`
      };
    }
  }

  return {
    allowed: true,
    sanitized: trimmed
  };
}

export default {
  validateCommentContent
};
