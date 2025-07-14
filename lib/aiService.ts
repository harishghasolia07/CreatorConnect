import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
}

/**
 * Generate embeddings using Gemini's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        if (!genAI) {
            console.warn('Gemini AI not initialized, returning zero vector');
            return new Array(768).fill(0);
        }

        const model = genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        // Return a zero vector as fallback
        return new Array(768).fill(0);
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate semantic matching score using Gemini AI
 */
export async function generateSemanticScore(
    briefDescription: string,
    creatorBio: string,
    creatorSkills: string[]
): Promise<number> {
    try {
        // Combine creator information for better matching
        const creatorText = `${creatorBio} Skills: ${creatorSkills.join(', ')}`;

        // Generate embeddings for both texts
        const [briefEmbedding, creatorEmbedding] = await Promise.all([
            generateEmbedding(briefDescription),
            generateEmbedding(creatorText)
        ]);

        // Calculate similarity (returns value between -1 and 1)
        const similarity = cosineSimilarity(briefEmbedding, creatorEmbedding);

        // Convert to a score between 0 and 10 for our scoring system
        return Math.max(0, similarity * 10);
    } catch (error) {
        console.error('Error calculating semantic score:', error);
        return 0;
    }
}

/**
 * Generate AI-powered match explanation using Gemini
 */
export async function generateMatchExplanation(
    briefDescription: string,
    creatorName: string,
    creatorBio: string,
    creatorSkills: string[],
    ruleBasedScore: number,
    semanticScore: number
): Promise<string> {
    try {
        if (!genAI) {
            return `${creatorName} is a good match with a compatibility score of ${ruleBasedScore}/20. This creator's skills and experience align well with the project requirements.`;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are an AI matchmaking assistant. Explain why this creator is a good match for the project brief.

PROJECT BRIEF: "${briefDescription}"

CREATOR PROFILE:
- Name: ${creatorName}
- Bio: ${creatorBio}
- Skills: ${creatorSkills.join(', ')}

SCORING:
- Rule-based score: ${ruleBasedScore}/20
- AI semantic score: ${semanticScore.toFixed(1)}/10

Generate a concise, 2-3 sentence explanation of why this creator matches the project. Focus on specific skill overlaps, style compatibility, or experience relevance. Be natural and helpful.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating AI explanation:', error);
        return `This creator matches your project with a combined score of ${(ruleBasedScore + semanticScore).toFixed(1)}. They have relevant skills and experience for your requirements.`;
    }
}
