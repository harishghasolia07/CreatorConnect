import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, TIMEOUTS } from './constants';
import { ENV_CONFIG } from './env';

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null;
try {
    if (ENV_CONFIG.isAiEnabled && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (error) {
    console.error('❌ AI Initialization - Gemini AI setup failed:', error);
}

/**
 * Generate embeddings using Gemini's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        if (!genAI) {
            console.warn('Gemini AI not initialized, returning zero vector');
            return new Array(AI_CONFIG.EMBEDDING_DIMENSIONS).fill(0);
        }

        const model = genAI.getGenerativeModel({ model: AI_CONFIG.EMBEDDING_MODEL });

        // Add timeout wrapper for consistency
        const result = await Promise.race([
            model.embedContent(text),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Embedding generation timeout')), TIMEOUTS.AI_OPERATION)
            )
        ]);

        const embedding = result.embedding.values;

        // Validate dimension - CONSISTENCY FIX
        if (embedding.length !== AI_CONFIG.EMBEDDING_DIMENSIONS) {
            console.warn(`⚠️ AI Service: Invalid embedding dimension: ${embedding.length}, expected ${AI_CONFIG.EMBEDDING_DIMENSIONS}`);
            return new Array(AI_CONFIG.EMBEDDING_DIMENSIONS).fill(0);
        }

        return embedding;
    } catch (error) {
        console.error('❌ AI Service - embedding generation failed:', error);
        // Return a zero vector as fallback
        return new Array(AI_CONFIG.EMBEDDING_DIMENSIONS).fill(0);
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
    creatorSkills: string[],
    creatorCategories?: string[]
): Promise<number> {
    try {
        // Combine creator information for better matching - CONSISTENT with database storage
        let creatorText = `${creatorBio} Skills: ${creatorSkills.join(', ')}`;
        if (creatorCategories && creatorCategories.length > 0) {
            creatorText += ` Categories: ${creatorCategories.join(', ')}`;
        }

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
        console.error('❌ AI Service - semantic score calculation failed:', error);
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
            return `${creatorName} is a strong match due to their relevant experience and skills that align with your project needs. Their expertise makes them well-suited for this type of work.`;
        }

        const model = genAI.getGenerativeModel({ model: AI_CONFIG.GENERATION_MODEL });

        const prompt = `
As an expert creative matchmaker, analyze why this creator is perfect for this project brief and write a compelling, specific explanation.

PROJECT BRIEF: "${briefDescription}"

CREATOR PROFILE:
- Name: ${creatorName}
- Bio: ${creatorBio}
- Skills: ${creatorSkills.join(', ')}
- Rule-based compatibility: ${ruleBasedScore}/20 points
- Style/semantic match: ${semanticScore.toFixed(1)}/10 points

TASK: Write a 2-3 sentence explanation that:
1. Identifies specific skills/experience that match the project requirements
2. Mentions style compatibility or creative approach alignment
3. Explains why this creator stands out for THIS specific project
4. Uses natural, engaging language (avoid generic phrases like "good match" or "relevant skills")

Example style: "Sarah's expertise in outdoor adventure photography and her proven track record shooting in challenging mountain conditions makes her ideal for your wilderness expedition documentary. Her portfolio demonstrates exactly the rugged, authentic storytelling approach you're seeking, while her technical skills with drone footage add the cinematic quality your project demands."

Write a compelling explanation for ${creatorName}:
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text().trim();

        // Validate that we got a meaningful response (not empty or too short)
        if (explanation && explanation.length > 50 && !explanation.includes('good match')) {
            return explanation;
        } else {
            // If the AI response is too generic, create a better fallback
            return generateDetailedFallback(creatorName, creatorBio, creatorSkills, briefDescription, ruleBasedScore, semanticScore);
        }
    } catch (error) {
        console.error(`❌ AI Service - match explanation generation for ${creatorName} failed:`, error);
        // Create a detailed fallback instead of generic message
        return generateDetailedFallback(creatorName, creatorBio, creatorSkills, briefDescription, ruleBasedScore, semanticScore);
    }
}

/**
 * Generate a detailed fallback explanation when AI fails
 */
function generateDetailedFallback(
    creatorName: string,
    creatorBio: string,
    creatorSkills: string[],
    briefDescription: string,
    ruleBasedScore: number,
    semanticScore: number
): string {
    // Extract key terms from brief and creator
    const briefLower = briefDescription.toLowerCase();
    const bioLower = creatorBio.toLowerCase();

    // Find specific skill matches
    const matchingSkills = creatorSkills.filter(skill =>
        briefLower.includes(skill.toLowerCase()) ||
        skill.toLowerCase().split(' ').some(word => briefLower.includes(word))
    );

    // Build specific explanation
    let explanation = `${creatorName}`;

    if (matchingSkills.length > 0) {
        explanation += ` specializes in ${matchingSkills.slice(0, 2).join(' and ')}, which directly aligns with your project requirements.`;
    } else {
        explanation += `'s experience and creative approach make them well-suited for your project.`;
    }

    if (semanticScore > 3) {
        explanation += ` Their portfolio and style demonstrate strong compatibility with your creative vision.`;
    } else if (ruleBasedScore > 10) {
        explanation += ` They meet all the key criteria for location, budget, and technical requirements.`;
    }

    return explanation;
}
