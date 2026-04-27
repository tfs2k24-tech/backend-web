import app from "../app.js";
import { connectToDatabase } from "../lib/db.js";

let ready = false;

async function ensureReady() {
  if (!ready) {
    await connectToDatabase();
    ready = true;
  }
}

export default async function handler(req, res) {
  await ensureReady();
  return app(req, res);
}
