import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Creator from '@/lib/models/Creator';

export async function GET() {
  try {
    await connectDB();
    const creators = await Creator.find({}).sort({ rating: -1 });
    
    return NextResponse.json({ success: true, creators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const creator = new Creator(body);
    await creator.save();
    
    return NextResponse.json({ success: true, creator });
  } catch (error) {
    console.error('Error creating creator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create creator' },
      { status: 500 }
    );
  }
}