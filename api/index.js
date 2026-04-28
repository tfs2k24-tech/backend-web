import app from "../app.js";
import { connectToDatabase } from "../lib/db.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectToDatabase();
    isConnected = true;
  }
  return app(req, res);
}
