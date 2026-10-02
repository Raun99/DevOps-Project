import { describe, it, expect } from 'vitest';
import { validateCommentContent } from '../services/moderationService.js';

describe('Comment Moderation Service', () => {
  it('allows valid scholarly commentary', () => {
    const res = validateCommentContent('The geometry of the celestial arches demonstrates refined acoustics.');
    expect(res.allowed).toBe(true);
    expect(res.sanitized).toBe('The geometry of the celestial arches demonstrates refined acoustics.');
  });

  it('rejects empty or whitespace-only comments', () => {
    const res = validateCommentContent('   ');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('empty');
  });

  it('rejects comments shorter than 2 characters', () => {
    const res = validateCommentContent('a');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('at least 2 characters');
  });

  it('rejects comments containing prohibited words with word boundaries', () => {
    const res = validateCommentContent('This article is complete spam and noise.');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('prohibited term: "spam"');
  });

  it('does not false-positive on legitimate words containing substrings', () => {
    const res = validateCommentContent('The compass points toward the true astral north.');
    expect(res.allowed).toBe(true);
  });

  it('catches obfuscated leetspeak violations', () => {
    const res = validateCommentContent('Visit this $c@m immediately!');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('obfuscated prohibited term');
  });

  it('rejects executable scripts or injection markup', () => {
    const res = validateCommentContent('<script>alert("hacked")</script> Good read.');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('Script or executable markup detected');
  });

  it('flags comments with suspicious scam domains', () => {
    const res = validateCommentContent('Free gold tokens available at http://vault-bonus.xyz right now!');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('flagged link pattern');
  });
});
