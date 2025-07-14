"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Wand2 } from 'lucide-react';

const briefSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  category: z.string().min(1, 'Category is required'),
  preferredStyles: z.string(),
  budgetMax: z.number().min(1000, 'Budget must be at least ₹1,000'),
  startDate: z.string(),
  endDate: z.string(),
  clientName: z.string().min(2, 'Name is required'),
  clientEmail: z.string().email('Valid email is required'),
});

type BriefFormData = z.infer<typeof briefSchema>;

interface BriefFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const categories = [
  'Photography', 'Videography', 'Graphic Design', 'Web Development',
  'Content Writing', 'Music Production', 'Fashion', 'Architecture',
  'Interior Design', 'Marketing', 'Illustration', 'Animation'
];

// Sample data for testing
const sampleProjects = [
  {
    title: "Wedding Photography in Goa",
    description: "Looking for an experienced wedding photographer to capture our beach wedding in Goa. We want candid, natural shots with a romantic feel. The wedding will be outdoors during sunset with around 100 guests. We prefer a documentary style with some posed family photos.",
    city: "Goa",
    country: "India",
    category: "Photography",
    preferredStyles: "romantic, candid, documentary, natural lighting",
    budgetMax: 75000,
    startDate: "2025-03-15",
    endDate: "2025-03-17",
    clientName: "Priya Sharma",
    clientEmail: "priya.sharma@email.com"
  },
  {
    title: "Logo Design for Tech Startup",
    description: "We're a fintech startup looking for a modern, professional logo design. The logo should convey trust, innovation, and simplicity. We prefer clean, minimalist designs with a modern color palette. The logo will be used across digital platforms, business cards, and marketing materials.",
    city: "Bangalore",
    country: "India",
    category: "Graphic Design",
    preferredStyles: "modern, minimalist, professional, clean, tech-focused",
    budgetMax: 25000,
    startDate: "2025-02-01",
    endDate: "2025-02-15",
    clientName: "Rahul Gupta",
    clientEmail: "rahul@techstartup.com"
  }
];

export default function BriefForm({ onSubmit, loading }: BriefFormProps) {
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema)
  });

  const watchedCategory = watch('category');

  const fillSampleData = () => {
    const sample = sampleProjects[currentSampleIndex];

    // Fill all form fields
    setValue('title', sample.title);
    setValue('description', sample.description);
    setValue('city', sample.city);
    setValue('country', sample.country);
    setValue('category', sample.category);
    setValue('preferredStyles', sample.preferredStyles);
    setValue('budgetMax', sample.budgetMax);
    setValue('startDate', sample.startDate);
    setValue('endDate', sample.endDate);
    setValue('clientName', sample.clientName);
    setValue('clientEmail', sample.clientEmail);

    // Switch to next sample for next time
    setCurrentSampleIndex((prev) => (prev + 1) % sampleProjects.length);
  };

  const handleFormSubmit = (data: BriefFormData) => {
    const formattedData = {
      ...data,
      location: {
        city: data.city,
        country: data.country
      },
      preferredStyles: data.preferredStyles.split(',').map(s => s.trim()).filter(s => s),
      budgetMax: Number(data.budgetMax)
    };
    onSubmit(formattedData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Submit Your Creative Brief
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">Tell us about your project and we&apos;ll find the perfect creators for you</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={fillSampleData}
            className="flex items-center gap-2 shrink-0 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fill Sample Data</span>
            <span className="sm:hidden">Sample</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Your Name</Label>
              <Input
                id="clientName"
                placeholder="John Doe"
                {...register('clientName')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm">{errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email Address</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="john@example.com"
                {...register('clientEmail')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.clientEmail && (
                <p className="text-red-500 text-sm">{errors.clientEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="e.g., Beach Wedding Photography in Goa"
              {...register('title')}
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project requirements, style preferences, and any specific details..."
              rows={4}
              {...register('description')}
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Mumbai"
                {...register('city')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="India"
                {...register('country')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.country && (
                <p className="text-red-500 text-sm">{errors.country.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                placeholder="50000"
                {...register('budgetMax', { valueAsNumber: true })}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.budgetMax && (
                <p className="text-red-500 text-sm">{errors.budgetMax.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredStyles">Preferred Styles (comma-separated)</Label>
            <Input
              id="preferredStyles"
              placeholder="e.g., modern, minimalist, vibrant, outdoor"
              {...register('preferredStyles')}
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-blue-300 dark:hover:border-blue-400"
            />
            {errors.preferredStyles && (
              <p className="text-red-500 text-sm">{errors.preferredStyles.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Find Perfect Creators
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}