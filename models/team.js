import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, default: "" },
});

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
