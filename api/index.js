import app from "../app.js";
import { connectToDatabase } from "../lib/db.js";
import serverless from "serverless-http";

await connectToDatabase();

export default serverless(app);
