import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Certificate title is required"],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true
    },
    credentialId: {
      type: String,
      default: "",
      trim: true
    },
    credentialUrl: {
      type: String,
      default: "",
      trim: true
    },
    issueDate: Date,
    expiryDate: Date,
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;

