"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminKeyModalProps {
    onConfirm: (adminKey: string) => void;
    trigger: React.ReactNode;
}

export function AdminKeyModal({ onConfirm, trigger }: AdminKeyModalProps) {
    const [open, setOpen] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!adminKey.trim()) {
            return;
        }

        setIsLoading(true);
        try {
            await onConfirm(adminKey);
            setOpen(false);
            setAdminKey('');
        } catch (error) {
            // Error handling is done in the parent component
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setAdminKey('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Admin Authentication Required
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        This action will delete all existing creators and replace them with sample data.
                        Please enter the admin key to proceed.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <strong>Warning:</strong> This will permanently delete all existing creator data.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-key">Admin Key</Label>
                        <Input
                            id="admin-key"
                            type="password"
                            placeholder="Enter admin key..."
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={!adminKey.trim() || isLoading}
                        >
                            {isLoading ? 'Seeding...' : 'Seed Data'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
