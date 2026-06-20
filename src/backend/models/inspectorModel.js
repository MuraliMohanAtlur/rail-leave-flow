import mongoose from "mongoose";

const inspectorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    stationName: { type: String }, // Optional
  },
  { timestamps: true }
);

export const Inspector = mongoose.models.Inspector || mongoose.model("Inspector", inspectorSchema);
