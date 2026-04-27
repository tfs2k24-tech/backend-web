import dotenv from "dotenv";
import app from "./app.js";
import { connectToDatabase } from "./lib/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
