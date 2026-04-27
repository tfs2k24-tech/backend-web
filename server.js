import dotenv from "dotenv";
import app from "./app.js";
import { connectToDatabase } from "./lib/db.js";
import serverless from "serverless-http";

dotenv.config();

// Connect DB once
await connectToDatabase();

// Export handler for Vercel
export const handler = serverless(app);
