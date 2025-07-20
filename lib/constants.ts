/**
 * Application-wide constants
 */

/**
 * Timeout configurations in milliseconds
 */
export const TIMEOUTS = {
    AI_OPERATION: 15000,      // 15 seconds for AI operations (embedding, scoring, explanations)
    FULL_MATCHING: 30000,     // 30 seconds for complete matching process
    DATABASE_CONNECT: 10000,  // 10 seconds for database connection
    DATABASE_SOCKET: 45000,   // 45 seconds for database socket operations
} as const;

/**
 * AI Model configurations
 */
export const AI_CONFIG = {
    EMBEDDING_MODEL: 'embedding-001',
    GENERATION_MODEL: 'gemini-pro',
    EMBEDDING_DIMENSIONS: 768,
    EMBEDDING_CACHE_DAYS: 30,
} as const;

/**
 * Scoring system constants
 */
export const SCORING = {
    MAX_RULE_BASED: 23,       // Maximum rule-based score (with portfolio matching)
    MAX_SEMANTIC: 10,         // Maximum AI semantic score
    MIN_FILTER_SCORE: 2,      // Minimum score for pre-filtering
} as const;
