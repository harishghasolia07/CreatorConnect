import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { ENV_CONFIG } from '@/lib/env';

export async function GET() {
    try {
        // Test database connection
        await connectDB();

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            features: {
                database: true,
                ai: ENV_CONFIG.isAiEnabled,
                admin: ENV_CONFIG.isAdminEnabled,
            },
            message: 'CreatorConnect API is running successfully'
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            features: {
                database: false,
                ai: ENV_CONFIG.isAiEnabled,
                admin: ENV_CONFIG.isAdminEnabled,
            }
        }, { status: 500 });
    }
}
