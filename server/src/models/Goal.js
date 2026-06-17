import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true
    },
    role: {
      type: String,
      default: "",
      trim: true
    },
    targetCompany: {
      type: String,
      default: "",
      trim: true
    },
    deadline: Date,
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started"
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;

