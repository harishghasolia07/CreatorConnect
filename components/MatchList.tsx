"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, DollarSign, Calendar, Mail, User, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

interface Creator {
  _id: string;
  name: string;
  location: { city: string; country: string };
  categories: string[];
  skills: string[];
  experienceYears: number;
  budgetRange: { min: number; max: number };
  rating: number;
  bio: string;
  avatar?: string;
}

interface Match {
  creator: Creator;
  score: number;
  ruleBasedScore?: number;
  semanticScore?: number;
  explanation: string[] | string;
  reasons?: string[];
  aiEnhanced?: boolean;
}

interface MatchListProps {
  matches: Match[];
  briefTitle: string;
  briefId?: string;
  aiEnabled?: boolean;
}

export default function MatchList({ matches, briefTitle, briefId, aiEnabled }: MatchListProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<string>>(new Set());

  const submitFeedback = async (creatorId: string, rating: number, helpful: boolean) => {
    if (!briefId) return;

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefId,
          creatorId,
          rating,
          helpful
        })
      });

      if (response.ok) {
        setFeedbackSubmitted(prev => new Set(Array.from(prev).concat(creatorId)));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (!matches || matches.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="text-gray-500 text-lg">No matches found for your brief.</div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent Match";
    if (score >= 6) return "Good Match";
    if (score >= 4) return "Fair Match";
    return "Basic Match";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Found {matches.length} Perfect Matches
          </h2>
          {aiEnabled && (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Enhanced
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300">For: &quot;{briefTitle}&quot;</p>
        {aiEnabled && (
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Results powered by AI semantic matching + rule-based scoring
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {matches.map((match, index) => {
          const { creator, score, explanation } = match;
          return (
            <Card key={creator._id} className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 card-hover">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                        <AvatarFallback className="bg-blue-600 dark:bg-blue-500 text-white font-semibold">
                          {creator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2">
                        <Badge className={`${getScoreColor(score)} text-white font-bold px-2 py-1 rounded-full text-xs`}>
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {creator.name}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{creator.location.city}, {creator.location.country}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="font-medium">{creator.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{creator.experienceYears} years</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>₹{creator.budgetRange.min.toLocaleString()} - ₹{creator.budgetRange.max.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getScoreColor(match.score)}`}>
                      {match.aiEnhanced ? (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{match.score.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span>Score: {match.score}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getScoreLabel(match.score)}
                    </div>
                    {match.aiEnhanced && match.ruleBasedScore !== undefined && match.semanticScore !== undefined && (
                      <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                        <div>Rules: {match.ruleBasedScore}</div>
                        <div>AI: {match.semanticScore.toFixed(1)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{creator.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-1">
                      {creator.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {creator.skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                      {creator.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                          +{creator.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Why This Match?</h4>
                  {typeof explanation === 'string' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{explanation}</p>
                  ) : (
                    <ul className="space-y-1">
                      {explanation.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Feedback Section */}
                {briefId && !feedbackSubmitted.has(creator._id) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Was this match helpful?</h5>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => submitFeedback(creator._id, 5, true)}
                        className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => submitFeedback(creator._id, 2, false)}
                        className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        No
                      </Button>
                    </div>
                  </div>
                )}

                {feedbackSubmitted.has(creator._id) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="text-sm text-green-600 dark:text-green-400">✓ Thank you for your feedback!</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white button-hover">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" className="flex-1 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 button-hover">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Creator
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}