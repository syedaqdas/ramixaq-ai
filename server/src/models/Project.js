import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true
    },
    techStack: {
      type: [String],
      default: []
    },
    githubLink: {
      type: String,
      default: "",
      trim: true
    },
    liveLink: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "Archived"],
      default: "Planned"
    },
    featured: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;

