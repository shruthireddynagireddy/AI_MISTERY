import mongoose from 'mongoose';
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) return false;
  try { await mongoose.connect(process.env.MONGODB_URI); console.info('MongoDB connected'); return true; }
  catch (error) { console.error('MongoDB connection failed; using in-memory demo storage.'); return false; }
}
