import mongoose from 'mongoose';

// Lazy evaluation so the app doesn't immediately crash if the env var is missing during build time
const getMongoUri = () => process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = getMongoUri();
  if (!uri) {
    console.warn('\n⚠️ WARNING: MONGODB_URI is not set in environment variables. Database operations will fail.');
    // We throw to prevent operations from silently failing
    throw new Error('MONGODB_URI is missing');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
