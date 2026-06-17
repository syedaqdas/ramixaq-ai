import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    targetRole: {
      type: String,
      default: "MERN Stack Intern",
      trim: true
    },
    extractedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    suggestions: {
      type: [String],
      default: []
    },
    textPreview: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

export default ResumeAnalysis;

