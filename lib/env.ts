/**
 * Environment variables validation and setup
 */

export function validateEnvironment() {
    const requiredVars = {
        MONGODB_URI: process.env.MONGODB_URI,
    };

    const optionalVars = {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        ADMIN_SEED_KEY: process.env.ADMIN_SEED_KEY,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    };

    // Check required variables
    const missingRequired = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingRequired.length > 0) {
        throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
    }

    return {
        isAiEnabled: !!optionalVars.GEMINI_API_KEY,
        isAdminEnabled: !!optionalVars.ADMIN_SEED_KEY,
        mongoUri: requiredVars.MONGODB_URI,
    };
}

export const ENV_CONFIG = validateEnvironment();
