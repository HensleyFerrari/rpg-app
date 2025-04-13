import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(uri);
    return mongoose.connection;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};
