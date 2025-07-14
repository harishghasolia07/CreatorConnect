"use client";

import { useState } from 'react';
import BriefForm from '@/components/BriefForm';
import MatchList from '@/components/MatchList';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

interface Match {
  creator: any;
  score: number;
  explanation: string[];
}

export default function FindCreatorsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [briefTitle, setBriefTitle] = useState('');
  const [briefId, setBriefId] = useState<string>('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false); const handleSubmitBrief = async (briefData: any) => {
    setLoading(true);
    setBriefTitle(briefData.title);

    try {
      const response = await fetch('/api/briefs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(briefData),
      });

      const result = await response.json();

      if (result.success) {
        // Use enhanced matches if available, fallback to traditional matches
        const matchesToShow = result.enhancedMatches || result.matches || result.traditionalMatches || [];
        setMatches(matchesToShow);
        setBriefId(result.brief?._id || '');
        setAiEnabled(result.aiEnabled || false);
        setShowResults(true);
      } else {
        const errorMsg = result.error || 'Unknown error occurred';
        alert('Error: ' + errorMsg);
      }
    } catch (error) {
      alert('Failed to submit brief. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setMatches([]);
    setBriefTitle('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  CreatorConnect
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">AI-Powered Creator Matching</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <ThemeToggle />
              {showResults && (
                <Button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white button-hover text-sm sm:text-base px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">New Brief</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!showResults ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Tell Us About Your Project
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
                Fill out the form below and our AI will find the perfect creators for your project based on your requirements.
              </p>
            </div>
            <BriefForm onSubmit={handleSubmitBrief} loading={loading} />
          </div>
        ) : (
          <MatchList
            matches={matches}
            briefTitle={briefTitle}
            briefId={briefId}
            aiEnabled={aiEnabled}
          />
        )}
      </main>
    </div>
  );
}