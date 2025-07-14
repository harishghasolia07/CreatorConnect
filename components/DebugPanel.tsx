"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function DebugPanel() {
    const [healthStatus, setHealthStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setHealthStatus(data);
        } catch (error) {
            setHealthStatus({
                status: 'error',
                error: error instanceof Error ? error.message : 'Network error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>

            <Button
                onClick={checkHealth}
                disabled={loading}
                className="mb-3"
            >
                {loading ? 'Checking...' : 'Check API Health'}
            </Button>

            {healthStatus && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
                </div>
            )}
        </Card>
    );
}
