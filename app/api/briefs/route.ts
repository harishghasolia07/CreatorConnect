import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brief from '@/lib/models/Brief';
import Creator from '@/lib/models/Creator';
import { rankMatches } from '@/lib/matcher';
import { enhancedMatcher } from '@/lib/enhancedMatcher';
import { optimizedMatcher } from '@/lib/optimizedMatcher';
import { ENV_CONFIG } from '@/lib/env';

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

    // Validate required fields
    if (!title || !description || !location || !category || !budgetMax || !startDate || !endDate || !clientName || !clientEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate location object
    if (!location.city || !location.country) {
      return NextResponse.json(
        { success: false, error: 'Location must include city and country' },
        { status: 400 }
      );
    }

    // Create new brief
    const brief = new Brief({
      title,
      description,
      location,
      category,
      preferredStyles: preferredStyles || [],
      budgetMax: Number(budgetMax),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      clientName,
      clientEmail
    });

    // Get all creators with error handling
    const creators = await Creator.find({}).limit(100); // Limit to prevent timeout

    if (creators.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No creators found in database' },
        { status: 404 }
      );
    }

    // Check if AI features should be enabled
    const useAI = ENV_CONFIG.isAiEnabled;

    let enhancedMatches: any[] = [];
    let traditionalMatches: any[] = [];

    try {
      // Use optimized matcher for better performance
      enhancedMatches = await optimizedMatcher.getTopMatches(creators, brief, 10, useAI);

      // Also get traditional matches for comparison (fast fallback)
      traditionalMatches = rankMatches(creators, brief);

    } catch (matchError) {
      // Fallback to traditional matching only
      try {
        traditionalMatches = rankMatches(creators, brief);
        enhancedMatches = traditionalMatches.map(match => ({
          creator: match.creator,
          score: match.score,
          ruleBasedScore: match.score,
          semanticScore: 0,
          explanation: match.explanation,
          reasons: match.explanation || []
        }));
      } catch (fallbackError) {
        enhancedMatches = [];
        traditionalMatches = [];
      }
    }

    // Store enhanced matches in brief
    brief.matches = enhancedMatches.map(match => ({
      creatorId: match.creator._id,
      score: match.score,
      explanation: Array.isArray(match.explanation) ? match.explanation : (match.reasons || [])
    }));

    const savedBrief = await brief.save();

    // Return brief with populated creator data
    const populatedBrief = await Brief.findById(savedBrief._id).populate('matches.creatorId');

    return NextResponse.json({
      success: true,
      brief: populatedBrief,
      enhancedMatches: enhancedMatches.map(match => ({
        creator: match.creator,
        score: match.score,
        ruleBasedScore: match.ruleBasedScore || match.score,
        semanticScore: match.semanticScore || 0,
        explanation: Array.isArray(match.explanation) ? match.explanation : (match.reasons || []),
        reasons: match.reasons || [],
        aiEnhanced: useAI && (match.semanticScore || 0) > 0,
        aiExplanation: match.aiExplanation
      })),
      traditionalMatches: traditionalMatches.map(match => ({
        creator: match.creator,
        score: match.score,
        explanation: Array.isArray(match.explanation) ? match.explanation : [match.explanation || 'Basic match']
      })),
      aiEnabled: useAI,
      message: useAI ? 'Matches generated using AI-enhanced algorithm' : 'Matches generated using rule-based algorithm',
      stats: {
        totalCreators: creators.length,
        enhancedMatches: enhancedMatches.length,
        traditionalMatches: traditionalMatches.length
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create brief',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}