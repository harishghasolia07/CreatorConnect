import { ICreator } from './models/Creator';
import { generateSemanticScore, generateMatchExplanation, generateEmbedding } from './aiService';

export interface OptimizedMatchResult {
  creator: ICreator;
  score: number;
  ruleBasedScore: number;
  semanticScore: number;
  aiExplanation?: string;
  explanation: string;
  reasons: string[];
}

/**
 * Optimized matcher with performance improvements
 */
export class OptimizedMatcher {

  /**
   * Calculate rule-based score (original logic) - FAST
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

    // Portfolio tag matching (0-3 points) - NEW FEATURE
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
   * OPTIMIZATION 1: Batch process embeddings
   */
  private async batchEnsureEmbeddings(creators: ICreator[]): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find creators without recent embeddings
    const creatorsNeedingEmbeddings = creators.filter(creator =>
      !creator.embedding || !creator.lastEmbeddingUpdate || creator.lastEmbeddingUpdate < thirtyDaysAgo
    );

    if (creatorsNeedingEmbeddings.length === 0) return;

    console.log(`🔄 Updating embeddings for ${creatorsNeedingEmbeddings.length} creators...`);

    // PARALLEL embedding generation
    const embeddingPromises = creatorsNeedingEmbeddings.map(async (creator) => {
      try {
        const creatorText = `${creator.bio} Skills: ${creator.skills.join(', ')} Categories: ${creator.categories.join(', ')}`;
        creator.embedding = await generateEmbedding(creatorText);
        creator.lastEmbeddingUpdate = new Date();
        await creator.save();
      } catch (error) {
        console.error(`Failed to generate embedding for ${creator.name}:`, error);
      }
    });

    await Promise.all(embeddingPromises);
    console.log(`✅ Embeddings updated!`);
  }

  /**
   * OPTIMIZATION 2: Fast rule-based pre-filtering
   */
  private preFilterCreators(creators: ICreator[], brief: any, minScore: number = 2): ICreator[] {
    return creators
      .map(creator => ({
        creator,
        ruleScore: this.calculateRuleBasedScore(creator, brief).score
      }))
      .filter(item => item.ruleScore >= minScore) // Only process creators with decent rule-based scores
      .sort((a, b) => b.ruleScore - a.ruleScore) // Sort by rule score first
      .slice(0, 15) // Limit to top 15 for AI processing
      .map(item => item.creator);
  }

  /**
   * OPTIMIZATION 3: Parallel AI processing with timeout
   */
  private async processAIScores(
    creators: ICreator[],
    brief: any,
    timeout: number = 15000  // Increased timeout to 15 seconds
  ): Promise<Map<string, { semanticScore: number; explanation: string }>> {
    const results = new Map();

    const aiPromises = creators.map(async (creator) => {
      try {
        const ruleBasedScore = this.calculateRuleBasedScore(creator, brief).score;

        // First generate the semantic score with longer timeout
        const semanticScore = await Promise.race([
          generateSemanticScore(brief.description, creator.bio, creator.skills),
          new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error('Semantic score timeout after 15s')), timeout)
          )
        ]);

        // Then generate explanation with the actual semantic score and longer timeout
        const explanation = await Promise.race([
          generateMatchExplanation(
            brief.description,
            creator.name,
            creator.bio,
            creator.skills,
            ruleBasedScore,
            semanticScore
          ),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Explanation timeout after 15s')), timeout)
          )
        ]);

        results.set(String(creator._id), { semanticScore, explanation });
        console.log(`✅ AI processing successful for ${creator.name}: semantic=${semanticScore.toFixed(1)}, explanation=${explanation.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ AI processing failed for ${creator.name}:`, error);
        // Fallback to rule-based only with empty explanation (will use fallback logic)
        results.set(String(creator._id), { semanticScore: 0, explanation: '' });
      }
    });

    await Promise.allSettled(aiPromises); // Don't fail if some AI calls fail
    return results;
  }

  /**
   * OPTIMIZED: Fast matching with smart fallbacks
   */
  async findOptimizedMatches(creators: ICreator[], brief: any, useAI: boolean = true): Promise<OptimizedMatchResult[]> {
    console.time('⚡ Optimized Matching');

    // STEP 1: Fast rule-based pre-filtering (< 50ms)
    console.time('📋 Rule-based filtering');
    const preFilteredCreators = this.preFilterCreators(creators, brief);
    console.timeEnd('📋 Rule-based filtering');
    console.log(`🎯 Pre-filtered to ${preFilteredCreators.length} top candidates`);

    let aiResults = new Map();

    if (useAI && process.env.GEMINI_API_KEY) {
      // STEP 2: Batch update embeddings (parallel)
      console.time('🤖 Embedding updates');
      await this.batchEnsureEmbeddings(preFilteredCreators);
      console.timeEnd('🤖 Embedding updates');

      // STEP 3: Parallel AI processing with longer timeout
      console.time('🧠 AI processing');
      aiResults = await this.processAIScores(preFilteredCreators, brief, 15000); // 15 second timeout
      console.timeEnd('🧠 AI processing');
    }

    // STEP 4: Combine all results
    console.time('🔢 Score calculation');
    const results: OptimizedMatchResult[] = preFilteredCreators.map(creator => {
      const { score: ruleBasedScore, reasons } = this.calculateRuleBasedScore(creator, brief);
      const aiData = aiResults.get(String(creator._id)) || { semanticScore: 0, explanation: '' };

      const totalScore = ruleBasedScore + aiData.semanticScore;
      const explanation = aiData.explanation ||
        `Score: ${totalScore.toFixed(1)} (Rules: ${ruleBasedScore}, AI: ${aiData.semanticScore.toFixed(1)})`;

      return {
        creator,
        score: totalScore,
        ruleBasedScore,
        semanticScore: aiData.semanticScore,
        aiExplanation: aiData.explanation,
        explanation,
        reasons
      };
    });
    console.timeEnd('🔢 Score calculation');

    // STEP 5: Final sorting
    const sortedResults = results.sort((a, b) => b.score - a.score);

    console.timeEnd('⚡ Optimized Matching');
    console.log(`🏆 Returned ${sortedResults.length} optimized matches`);

    return sortedResults;
  }

  /**
   * Get top N matches with performance optimization and error handling
   */
  async getTopMatches(creators: ICreator[], brief: any, limit: number = 10, useAI: boolean = true): Promise<OptimizedMatchResult[]> {
    try {
      // Add timeout protection
      const matchingPromise = this.findOptimizedMatches(creators, brief, useAI);
      const timeoutPromise = new Promise<OptimizedMatchResult[]>((_, reject) =>
        setTimeout(() => reject(new Error('Matching timeout')), 30000) // 30 second timeout
      );

      const allMatches = await Promise.race([matchingPromise, timeoutPromise]);
      return allMatches.slice(0, limit);
    } catch (error) {
      console.error('Optimized matching failed, falling back to basic matching:', error);

      // Fallback to simple rule-based matching
      const { rankMatches } = await import('./matcher');
      const basicMatches = rankMatches(creators, brief);

      return basicMatches.slice(0, limit).map(match => ({
        creator: match.creator,
        score: match.score,
        ruleBasedScore: match.score,
        semanticScore: 0,
        explanation: Array.isArray(match.explanation) ? match.explanation.join('. ') : 'Basic compatibility match',
        reasons: Array.isArray(match.explanation) ? match.explanation : [match.explanation || 'Basic match']
      }));
    }
  }
}

// Export optimized singleton
export const optimizedMatcher = new OptimizedMatcher();
