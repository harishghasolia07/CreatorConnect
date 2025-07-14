import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brief from '@/lib/models/Brief';
import Creator from '@/lib/models/Creator';
import { rankMatches } from '@/lib/matcher';
import { enhancedMatcher } from '@/lib/enhancedMatcher';
import { optimizedMatcher } from '@/lib/optimizedMatcher';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      location,
      category,
      preferredStyles,
      budgetMax,
      startDate,
      endDate,
      clientName,
      clientEmail
    } = body;

    // Create new brief
    const brief = new Brief({
      title,
      description,
      location,
      category,
      preferredStyles,
      budgetMax,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      clientName,
      clientEmail
    });

    // Get all creators
    const creators = await Creator.find({});

    // Check if AI features should be enabled
    const useAI = process.env.GEMINI_API_KEY ? true : false;

    console.time('🚀 Total Matching Time');

    // Use optimized matcher for better performance
    const enhancedMatches = await optimizedMatcher.getTopMatches(creators, brief, 10, useAI);

    // Also get traditional matches for comparison (fast fallback)
    const traditionalMatches = rankMatches(creators, brief);

    console.timeEnd('🚀 Total Matching Time');

    // Store enhanced matches in brief
    brief.matches = enhancedMatches.map(match => ({
      creatorId: match.creator._id,
      score: match.score,
      explanation: match.aiExplanation || match.explanation
    }));

    await brief.save();

    // Return brief with populated creator data
    const savedBrief = await Brief.findById(brief._id).populate('matches.creatorId');

    return NextResponse.json({
      success: true,
      brief: savedBrief,
      enhancedMatches: enhancedMatches.map(match => ({
        creator: match.creator,
        score: match.score,
        ruleBasedScore: match.ruleBasedScore,
        semanticScore: match.semanticScore,
        explanation: match.aiExplanation || match.explanation,
        reasons: match.reasons,
        aiEnhanced: useAI && match.semanticScore > 0
      })),
      traditionalMatches: traditionalMatches.map(match => ({
        creator: match.creator,
        score: match.score,
        explanation: match.explanation
      })),
      aiEnabled: useAI,
      message: useAI ? 'Matches generated using AI-enhanced algorithm' : 'Matches generated using rule-based algorithm'
    });

  } catch (error) {
    console.error('Error creating brief:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create brief' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const briefs = await Brief.find({}).populate('matches.creatorId').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, briefs });
  } catch (error) {
    console.error('Error fetching briefs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}