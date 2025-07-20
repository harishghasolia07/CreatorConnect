import mongoose from 'mongoose';
import { TIMEOUTS } from './constants';

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  mongoose: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { mongoose: null, promise: null };
}

async function connectDB() {
  // Check if MongoDB URI is provided
  if (!MONGODB_URI) {
    throw new Error(
      'MongoDB connection string not found. Please set MONGODB_URI in your .env.local file.\n\n' +
      'For local development:\n' +
      'MONGODB_URI=mongodb://localhost:27017/creator-matchmaking\n\n' +
      'For MongoDB Atlas:\n' +
      'MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creator-matchmaking\n\n' +
      'See README.md for detailed setup instructions.'
    );
  }

  if (cached!.mongoose) {
    return cached!.mongoose;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: TIMEOUTS.DATABASE_CONNECT,
      socketTimeoutMS: TIMEOUTS.DATABASE_SOCKET,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      connectTimeoutMS: TIMEOUTS.DATABASE_CONNECT, // Give up initial connection after configured time
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    }).catch((error) => {
      throw error;
    });
  }

  try {
    cached!.mongoose = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw new Error(
      `Failed to connect to MongoDB: ${(e as Error).message}\n\n` +
      'Please ensure:\n' +
      '1. MongoDB is running (if using local MongoDB)\n' +
      '2. MONGODB_URI is correctly set in .env.local\n' +
      '3. Network connectivity to your MongoDB instance\n\n' +
      'See README.md for setup instructions.'
    );
  }

  return cached!.mongoose;
}

export default connectDB;