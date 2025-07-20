import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Creator from '@/lib/models/Creator';
import { generateEmbedding } from '@/lib/aiService';
import { ENV_CONFIG } from '@/lib/env';

// Admin authentication key (in production, use environment variable)
const ADMIN_KEY = process.env.ADMIN_SEED_KEY || 'admin123';

const sampleCreators = [
  {
    name: "Arjun Sharma",
    location: { city: "Goa", country: "India" },
    categories: ["Photography", "Videography"],
    skills: ["Wedding Photography", "Portrait", "Beach Photography", "Drone"],
    experienceYears: 7,
    budgetRange: { min: 25000, max: 80000 },
    portfolio: [
      { url: "https://example.com/portfolio1", tags: ["wedding", "beach", "sunset"] },
      { url: "https://example.com/portfolio2", tags: ["portrait", "lifestyle"] }
    ],
    rating: 4.8,
    bio: "Award-winning photographer specializing in destination weddings and beach photography in Goa.",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Priya Menon",
    location: { city: "Mumbai", country: "India" },
    categories: ["Graphic Design", "Branding"],
    skills: ["Logo Design", "Brand Identity", "Digital Marketing", "UI/UX"],
    experienceYears: 5,
    budgetRange: { min: 15000, max: 50000 },
    portfolio: [
      { url: "https://example.com/portfolio3", tags: ["modern", "minimalist", "corporate"] },
      { url: "https://example.com/portfolio4", tags: ["colorful", "creative", "startup"] }
    ],
    rating: 4.6,
    bio: "Creative brand designer helping startups and established companies create memorable visual identities.",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Rohit Patil",
    location: { city: "Goa", country: "India" },
    categories: ["Music Production", "Audio"],
    skills: ["Music Composition", "Audio Mixing", "Sound Design", "Live Recording"],
    experienceYears: 8,
    budgetRange: { min: 20000, max: 75000 },
    portfolio: [
      { url: "https://example.com/portfolio5", tags: ["electronic", "ambient", "commercial"] },
      { url: "https://example.com/portfolio6", tags: ["acoustic", "indie", "folk"] }
    ],
    rating: 4.9,
    bio: "Professional music producer and sound engineer with experience in commercial and indie music.",
    avatar: "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Sneha Reddy",
    location: { city: "Bangalore", country: "India" },
    categories: ["Content Writing", "Marketing"],
    skills: ["Content Strategy", "SEO Writing", "Social Media", "Copywriting"],
    experienceYears: 4,
    budgetRange: { min: 10000, max: 35000 },
    portfolio: [
      { url: "https://example.com/portfolio7", tags: ["tech", "lifestyle", "health"] },
      { url: "https://example.com/portfolio8", tags: ["travel", "food", "culture"] }
    ],
    rating: 4.5,
    bio: "Content strategist and writer specializing in tech, lifestyle, and travel content for brands.",
    avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Vikram Singh",
    location: { city: "Delhi", country: "India" },
    categories: ["Photography", "Fashion"],
    skills: ["Fashion Photography", "Product Photography", "Studio Lighting", "Retouching"],
    experienceYears: 6,
    budgetRange: { min: 30000, max: 90000 },
    portfolio: [
      { url: "https://example.com/portfolio9", tags: ["fashion", "editorial", "luxury"] },
      { url: "https://example.com/portfolio10", tags: ["product", "commercial", "beauty"] }
    ],
    rating: 4.7,
    bio: "Fashion and commercial photographer with a keen eye for luxury brands and editorial work.",
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Meera Kapoor",
    location: { city: "Jaipur", country: "India" },
    categories: ["Interior Design", "Architecture"],
    skills: ["3D Modeling", "Space Planning", "Color Theory", "Furniture Design"],
    experienceYears: 8,
    budgetRange: { min: 40000, max: 120000 },
    portfolio: [
      { url: "https://example.com/portfolio11", tags: ["modern", "luxury", "residential"] },
      { url: "https://example.com/portfolio12", tags: ["commercial", "minimalist", "sustainable"] }
    ],
    rating: 4.9,
    bio: "Award-winning interior designer specializing in luxury residential and commercial spaces.",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Karan Mehta",
    location: { city: "Pune", country: "India" },
    categories: ["Web Development", "Mobile Apps"],
    skills: ["React", "Node.js", "Flutter", "UI/UX Design"],
    experienceYears: 5,
    budgetRange: { min: 35000, max: 85000 },
    portfolio: [
      { url: "https://example.com/portfolio13", tags: ["e-commerce", "responsive", "modern"] },
      { url: "https://example.com/portfolio14", tags: ["mobile-first", "progressive", "fast"] }
    ],
    rating: 4.6,
    bio: "Full-stack developer creating modern web and mobile applications for startups and enterprises.",
    avatar: "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Anjali Nair",
    location: { city: "Kochi", country: "India" },
    categories: ["Animation", "Video Editing"],
    skills: ["2D Animation", "Motion Graphics", "After Effects", "Premiere Pro"],
    experienceYears: 6,
    budgetRange: { min: 25000, max: 70000 },
    portfolio: [
      { url: "https://example.com/portfolio15", tags: ["explainer", "corporate", "colorful"] },
      { url: "https://example.com/portfolio16", tags: ["character", "storytelling", "engaging"] }
    ],
    rating: 4.8,
    bio: "Creative animator and video editor bringing stories to life through engaging visual content.",
    avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Rahul Gupta",
    location: { city: "Chandigarh", country: "India" },
    categories: ["Digital Marketing", "SEO"],
    skills: ["Google Ads", "Facebook Marketing", "SEO Optimization", "Analytics"],
    experienceYears: 7,
    budgetRange: { min: 20000, max: 60000 },
    portfolio: [
      { url: "https://example.com/portfolio17", tags: ["e-commerce", "lead-generation", "ROI"] },
      { url: "https://example.com/portfolio18", tags: ["brand-awareness", "social-media", "growth"] }
    ],
    rating: 4.5,
    bio: "Digital marketing expert helping businesses grow their online presence and drive conversions.",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Deepika Sharma",
    location: { city: "Hyderabad", country: "India" },
    categories: ["Illustration", "Graphic Design"],
    skills: ["Digital Illustration", "Character Design", "Logo Design", "Print Design"],
    experienceYears: 4,
    budgetRange: { min: 18000, max: 55000 },
    portfolio: [
      { url: "https://example.com/portfolio19", tags: ["whimsical", "colorful", "children"] },
      { url: "https://example.com/portfolio20", tags: ["corporate", "clean", "professional"] }
    ],
    rating: 4.7,
    bio: "Talented illustrator and designer creating unique visual identities and engaging illustrations.",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Arjit Singh",
    location: { city: "Lucknow", country: "India" },
    categories: ["Voice Over", "Audio Production"],
    skills: ["Voice Acting", "Dubbing", "Audio Editing", "Sound Design"],
    experienceYears: 9,
    budgetRange: { min: 15000, max: 45000 },
    portfolio: [
      { url: "https://example.com/portfolio21", tags: ["commercial", "documentary", "narration"] },
      { url: "https://example.com/portfolio22", tags: ["character", "animation", "gaming"] }
    ],
    rating: 4.8,
    bio: "Professional voice artist with a versatile range for commercials, documentaries, and character work.",
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Pooja Verma",
    location: { city: "Indore", country: "India" },
    categories: ["Event Planning", "Wedding Planning"],
    skills: ["Event Coordination", "Vendor Management", "Budget Planning", "Design Concepts"],
    experienceYears: 6,
    budgetRange: { min: 30000, max: 100000 },
    portfolio: [
      { url: "https://example.com/portfolio23", tags: ["luxury", "traditional", "destination"] },
      { url: "https://example.com/portfolio24", tags: ["corporate", "modern", "elegant"] }
    ],
    rating: 4.9,
    bio: "Experienced event planner creating memorable experiences for weddings and corporate events.",
    avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const body = await request.json();
    const { adminKey } = body;

    if (!adminKey || adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Clear existing creators
    await Creator.deleteMany({});

    // Pre-generate embeddings for performance optimization
    console.log('🤖 Pre-generating AI embeddings for creators...');
    const creatorsWithEmbeddings = [];

    for (const creator of sampleCreators) {
      try {
        // Generate embedding for creator profile
        const creatorText = `${creator.bio} Skills: ${creator.skills.join(', ')} Categories: ${creator.categories.join(', ')}`;
        const embedding = await generateEmbedding(creatorText);

        creatorsWithEmbeddings.push({
          ...creator,
          embedding,
          lastEmbeddingUpdate: new Date()
        });

        console.log(`✅ Generated embedding for ${creator.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to generate embedding for ${creator.name}:`, error);
        // Add creator without embedding as fallback
        creatorsWithEmbeddings.push(creator);
      }
    }

    // Insert sample creators with pre-computed embeddings
    await Creator.insertMany(creatorsWithEmbeddings);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${creatorsWithEmbeddings.length} creators with AI embeddings`,
      creators: creatorsWithEmbeddings,
      embeddingsGenerated: creatorsWithEmbeddings.filter((c: any) => c.embedding).length
    });
  } catch (error) {
    console.error('Error seeding creators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed creators' },
      { status: 500 }
    );
  }
}