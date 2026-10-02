// CLANDESTINE Canary Release Service
// Provides controlled canary rollout for threaded comments feature

const DEFAULT_CANARY_PERCENTAGE = parseInt(process.env.CANARY_COMMENT_PERCENT || '10', 10);

/**
 * Determines whether the given request qualifies for the Canary (v2) release
 * based on percentage hash, explicit header, or query flag.
 * 
 * @param {import('express').Request} req
 * @returns {{ isCanary: boolean, version: string, reason: string }}
 */
export function evaluateCanaryEligibility(req) {
  // 1. Explicit Canary header override (e.g. for testing / QA)
  const headerChannel = req.headers['x-canary-channel'];
  if (headerChannel === 'v2') {
    return { isCanary: true, version: 'v2-threaded-enhanced', reason: 'header-override' };
  }
  if (headerChannel === 'v1') {
    return { isCanary: false, version: 'v1-standard', reason: 'header-override' };
  }

  // 2. Query param override
  if (req.query?.canary === 'true' || req.query?.version === 'v2') {
    return { isCanary: true, version: 'v2-threaded-enhanced', reason: 'query-override' };
  }

  // 3. User ID or IP hash-based bucketing against configured percentage
  const identifier = (req.user && req.user.id) || req.ip || 'anonymous';
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const bucket = Math.abs(hash) % 100;
  const isCanary = bucket < DEFAULT_CANARY_PERCENTAGE;

  return {
    isCanary,
    version: isCanary ? 'v2-threaded-enhanced' : 'v1-standard',
    reason: `bucket-${bucket}-threshold-${DEFAULT_CANARY_PERCENTAGE}`
  };
}

/**
 * Formats comments into nested threaded hierarchy for v2 Canary, or flat list for v1.
 * 
 * @param {Array} comments 
 * @param {boolean} isCanary 
 */
export function formatCommentsPayload(comments, isCanary) {
  if (!isCanary) {
    return {
      version: 'v1',
      threaded: false,
      count: comments.length,
      comments: comments
    };
  }

  // v2: Hierarchical nesting with thread depth and metadata
  const commentMap = {};
  const rootComments = [];

  comments.forEach(c => {
    commentMap[c.id] = { ...c, replies: [], depth: 0 };
  });

  comments.forEach(c => {
    if (c.parent_id && commentMap[c.parent_id]) {
      const parent = commentMap[c.parent_id];
      commentMap[c.id].depth = (parent.depth || 0) + 1;
      parent.replies.push(commentMap[c.id]);
    } else {
      rootComments.push(commentMap[c.id]);
    }
  });

  return {
    version: 'v2-canary',
    threaded: true,
    count: comments.length,
    rootCount: rootComments.length,
    comments: rootComments
  };
}

export default {
  evaluateCanaryEligibility,
  formatCommentsPayload
};
