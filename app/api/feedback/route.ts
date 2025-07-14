import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback from '@/lib/models/Feedback';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { briefId, creatorId, rating, feedback, helpful } = await request.json();

    // Validate required fields
    if (!briefId || !creatorId || rating === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create feedback entry
    const feedbackEntry = new Feedback({
      briefId,
      creatorId,
      rating,
      feedback: feedback || '',
      helpful: helpful || false,
      submittedAt: new Date()
    });

    await feedbackEntry.save();

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedbackEntry._id
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');
    const briefId = searchParams.get('briefId');

    let query: any = {};

    if (creatorId) {
      query.creatorId = creatorId;
    }

    if (briefId) {
      query.briefId = briefId;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ submittedAt: -1 })
      .limit(100);

    // Calculate average rating for creator
    let averageRating = 0;
    if (creatorId && feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum: number, fb: any) => sum + fb.rating, 0);
      averageRating = totalRating / feedbacks.length;
    }

    return NextResponse.json({
      success: true,
      feedbacks,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalFeedbacks: feedbacks.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}