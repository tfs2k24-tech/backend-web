import app from "../app.js";
import { connectToDatabase } from "../lib/db.js";
import serverless from "serverless-http";

// connect DB
await connectToDatabase();

// export handler
export default serverless(app);
