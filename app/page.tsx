"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Search, Shield, TrendingUp, ArrowRight, Users, Zap, CheckCircle, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminKeyModal } from '@/components/AdminKeyModal';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LandingPage() {
  const { toast } = useToast();

  const handleSeedData = async (adminKey: string) => {
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey })
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success!",
          description: `Successfully seeded ${result.creators.length} creators`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center float-animation flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  CreatorConnect
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">AI-Powered Creator Matching</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <ThemeToggle />
              <AdminKeyModal
                onConfirm={handleSeedData}
                trigger={
                  <Button
                    variant="outline"
                    className="hidden sm:inline-flex text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 button-hover"
                  >
                    Seed Sample Data
                  </Button>
                }
              />
              <Link href="/find-creators">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white button-hover text-sm sm:text-base px-3 sm:px-4">
                  <span className="hidden sm:inline">Find Creators</span>
                  <span className="sm:hidden">Find</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Find the Perfect
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  Creator
                </span>
                <br />
                For Your Project
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Our AI-powered matching engine connects you with the most suitable creators based on your specific requirements, location, budget, and style preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
                <Link href="/find-creators" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg button-hover pulse-glow">
                    Start Matching Now
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-gray-300 dark:border-gray-600 button-hover">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose CreatorConnect?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
                Advanced technology meets human creativity to deliver perfect matches every time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center p-6 sm:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 card-hover">
                <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Smart Matching Algorithm</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Our AI considers location, skills, budget, portfolio style, and experience to find your perfect match.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 sm:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 card-hover">
                <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Verified Creators</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    All creators are verified with portfolios, ratings, and proven experience in their fields.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 sm:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 card-hover">
                <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Instant Results</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Get ranked matches with detailed explanations in seconds, not days of searching.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Simple steps to find your perfect creative partner
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl float-animation">
                  1
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Your Brief</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Tell us about your project, budget, timeline, and style preferences.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl float-animation" style={{ animationDelay: '0.5s' }}>
                  2
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Matching</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our algorithm analyzes thousands of creators to find the best matches.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl float-animation" style={{ animationDelay: '1s' }}>
                  3
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Review Matches</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  See ranked results with detailed explanations for each match.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl float-animation" style={{ animationDelay: '1.5s' }}>
                  4
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Connect & Hire</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Contact your chosen creators and start your project.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
                <div className="text-gray-600 dark:text-gray-300">Verified Creators</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Projects Completed</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">98%</div>
                <div className="text-gray-600 dark:text-gray-300">Match Satisfaction</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">24h</div>
                <div className="text-gray-600 dark:text-gray-300">Average Response Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Find Your Perfect Creator?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of satisfied clients who found their ideal creative partners through CreatorConnect.
            </p>
            <Link href="/find-creators">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-12 py-4 text-lg button-hover">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <span className="text-lg sm:text-xl font-bold text-white dark:text-gray-100">CreatorConnect</span>
              </div>
              <p className="text-sm">
                Connecting clients with the perfect creators through intelligent matching.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">How it Works</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Success Stories</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">For Creators</h3>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Join as Creator</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Creator Resources</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Best Practices</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">API Documentation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-sm">
            <p className="flex items-center justify-center gap-1">
              &copy; 2025 CreatorConnect. Made with
              <span className="text-red-500 text-base">❤️</span>
              By Harish
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}