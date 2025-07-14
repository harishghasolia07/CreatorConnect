import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brief from '@/lib/models/Brief';
import Creator from '@/lib/models/Creator';
import { ENV_CONFIG } from '@/lib/env';

export async function POST() {
    try {
        console.log('🧪 Starting API test...');

        // Test database connection
        await connectDB();
        console.log('✅ Database connected');

        // Test brief creation
        const testBrief = {
            title: 'Test Brief',
            description: 'This is a test brief to validate the API',
            location: {
                city: 'Test City',
                country: 'Test Country'
            },
            category: 'Content Creation',
            preferredStyles: ['Modern'],
            budgetMax: 1000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            clientName: 'Test Client',
            clientEmail: 'test@example.com'
        };

        const brief = new Brief(testBrief);
        const savedBrief = await brief.save();
        console.log('✅ Test brief created:', savedBrief._id);

        // Test creator fetch
        const creatorsCount = await Creator.countDocuments();
        console.log(`✅ Found ${creatorsCount} creators in database`);

        // Clean up test brief
        await Brief.findByIdAndDelete(savedBrief._id);
        console.log('✅ Test brief cleaned up');

        return NextResponse.json({
            success: true,
            message: 'API test completed successfully',
            timestamp: new Date().toISOString(),
            results: {
                database: 'connected',
                briefCreation: 'working',
                creatorsFound: creatorsCount,
                aiEnabled: ENV_CONFIG.isAiEnabled
            }
        });

    } catch (error) {
        console.error('❌ API test failed:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 500 });
    }
}
