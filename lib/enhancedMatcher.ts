import { ICreator } from './models/Creator';
import { generateSemanticScore, generateMatchExplanation, generateEmbedding } from './aiService';
import { AI_CONFIG } from './constants';
import { ENV_CONFIG } from './env';

export interface MatchResult {
    creator: ICreator;
    score: number;
    ruleBasedScore: number;
    semanticScore: number;
    aiExplanation?: string;
    explanation: string;
    reasons: string[];
}

/**
 * Enhanced matcher that combines rule-based scoring with AI semantic matching
 */
export class EnhancedMatcher {

    /**
     * Calculate rule-based score (original logic)
     */
    private calculateRuleBasedScore(creator: ICreator, brief: any): { score: number; reasons: string[] } {
        let score = 0;
        const reasons: string[] = [];

        // Location match (0-3 points)
        if (creator.location.city.toLowerCase() === brief.location.city.toLowerCase()) {
            score += 3;
            reasons.push('Exact Location Match');
        } else if (creator.location.country.toLowerCase() === brief.location.country.toLowerCase()) {
            score += 1;
            reasons.push('Same Country');
        }

        // Category match (0-5 points)
        if (creator.categories.includes(brief.category)) {
            score += 5;
            reasons.push('Category Expert');
        }

        // Budget compatibility (0-4 points)
        if (brief.budgetMax >= creator.budgetRange.min && brief.budgetMax <= creator.budgetRange.max) {
            score += 4;
            reasons.push('Perfect Budget Fit');
        } else if (brief.budgetMax >= creator.budgetRange.min) {
            score += 2;
            reasons.push('Budget Compatible');
        }

        // Style/Skills match (0-5 points)
        const briefStyles = brief.preferredStyles || [];
        const styleMatches = briefStyles.filter((style: string) =>
            creator.skills.some(skill =>
                skill.toLowerCase().includes(style.toLowerCase()) ||
                style.toLowerCase().includes(skill.toLowerCase())
            )
        );

        if (styleMatches.length > 0) {
            score += Math.min(5, styleMatches.length * 2);
            reasons.push(`Style Match (${styleMatches.length} matches)`);
        }

        // Portfolio tag matching (0-3 points) - CONSISTENCY FIX
        const portfolioTagMatches = briefStyles.filter((style: string) =>
            creator.portfolio.some(portfolioItem =>
                portfolioItem.tags.some(tag =>
                    tag.toLowerCase().includes(style.toLowerCase()) ||
                    style.toLowerCase().includes(tag.toLowerCase())
                )
            )
        );

        if (portfolioTagMatches.length > 0) {
            score += Math.min(3, portfolioTagMatches.length);
            reasons.push(`Portfolio Style Match (${portfolioTagMatches.length} matches)`);
        }

        // Experience bonus (0-3 points)
        if (creator.experienceYears >= 5) {
            score += 3;
            reasons.push('Highly Experienced');
        } else if (creator.experienceYears >= 2) {
            score += 1;
            reasons.push('Experienced');
        }

        return { score, reasons };
    }

    /**
     * Ensure creator has up-to-date embeddings
     */
    private async ensureCreatorEmbedding(creator: ICreator): Promise<void> {
        // Check if embedding exists and is recent (within 30 days)
        const thirtyDaysAgo = new Date(Date.now() - AI_CONFIG.EMBEDDING_CACHE_DAYS * 24 * 60 * 60 * 1000);

        if (!creator.embedding || !creator.lastEmbeddingUpdate || creator.lastEmbeddingUpdate < thirtyDaysAgo) {
            try {
                const creatorText = `${creator.bio} Skills: ${creator.skills.join(', ')} Categories: ${creator.categories.join(', ')}`;
                creator.embedding = await generateEmbedding(creatorText);
                creator.lastEmbeddingUpdate = new Date();

                // Save the updated embedding to database
                await creator.save();
            } catch (error) {
                console.error(`❌ Enhanced Matcher - embedding update for ${creator.name} failed:`, error);
            }
        }
    }

    /**
     * Find matches using enhanced algorithm (rule-based + AI)
     */
    async findMatches(creators: ICreator[], brief: any, useAI: boolean = true): Promise<MatchResult[]> {
        const results: MatchResult[] = [];

        for (const creator of creators) {
            // Calculate rule-based score
            const { score: ruleBasedScore, reasons } = this.calculateRuleBasedScore(creator, brief);

            let semanticScore = 0;
            let aiExplanation = '';

            if (useAI && ENV_CONFIG.isAiEnabled && process.env.GEMINI_API_KEY) {
                try {
                    // Ensure creator has embeddings
                    await this.ensureCreatorEmbedding(creator);

                    // Calculate semantic score using AI
                    semanticScore = await generateSemanticScore(
                        brief.description,
                        creator.bio,
                        creator.skills,
                        creator.categories
                    );

                    // Generate AI explanation
                    aiExplanation = await generateMatchExplanation(
                        brief.description,
                        creator.name,
                        creator.bio,
                        creator.skills,
                        ruleBasedScore,
                        semanticScore
                    );
                } catch (error) {
                    console.error(`❌ Enhanced Matcher - AI score calculation for ${creator.name} failed:`, error);
                    // Continue with rule-based only if AI fails
                }
            }

            // Combine scores (rule-based has max 20, semantic has max 10)
            const totalScore = ruleBasedScore + semanticScore;

            // Create explanation
            const explanation = aiExplanation ||
                `Score: ${totalScore.toFixed(1)} (Rules: ${ruleBasedScore}, AI: ${semanticScore.toFixed(1)})`;

            results.push({
                creator,
                score: totalScore,
                ruleBasedScore,
                semanticScore,
                aiExplanation,
                explanation,
                reasons
            });
        }

        // Sort by total score (descending) and return top matches
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Get top N matches with detailed scoring
     */
    async getTopMatches(creators: ICreator[], brief: any, limit: number = 10, useAI: boolean = true): Promise<MatchResult[]> {
        const allMatches = await this.findMatches(creators, brief, useAI);
        return allMatches.slice(0, limit);
    }
}

// Export singleton instance
export const enhancedMatcher = new EnhancedMatcher();
