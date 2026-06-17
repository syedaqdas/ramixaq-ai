import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true
    },
    category: {
      type: String,
      default: "Technical",
      trim: true
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },
    yearsExperience: {
      type: Number,
      default: 0,
      min: 0
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    targetRole: {
      type: String,
      default: "",
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;

