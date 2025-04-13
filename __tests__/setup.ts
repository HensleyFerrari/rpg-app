import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import "../models/Character";
import "../models/Campaign";
import "../models/Battle";
import "../models/Damage";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Ensure the MongoDB URI is set for all database operations
    process.env.MONGODB_URI = uri;

    // Create the mongoose connection
    await mongoose.connect(uri);
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
});

afterEach(async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error("Error cleaning test database:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
    await mongod.stop();
  } catch (error) {
    console.error("Error tearing down test database:", error);
    throw error;
  }
});
