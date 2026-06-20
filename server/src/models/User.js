import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: undefined,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      default: undefined,
      select: false
    },
    passwordResetToken: {
      type: String,
      default: undefined,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      default: undefined,
      select: false
    },
    loginOtpHash: {
      type: String,
      default: undefined,
      select: false
    },
    loginOtpExpires: {
      type: Date,
      default: undefined,
      select: false
    },
    loginOtpAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    loginOtpLastSentAt: {
      type: Date,
      default: undefined,
      select: false
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },
    headline: {
      type: String,
      default: "Aspiring software intern",
      trim: true,
      maxlength: 120
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true
    },
    avatarPublicId: {
      type: String,
      default: "",
      trim: true,
      select: false
    },
    publicSlug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: 60
    },
    github: {
      type: String,
      default: "",
      trim: true
    },
    linkedin: {
      type: String,
      default: "",
      trim: true
    },
    leetcode: {
      type: String,
      default: "",
      trim: true
    },
    portfolio: {
      type: String,
      default: "",
      trim: true
    },
    website: {
      type: String,
      default: "",
      trim: true
    },
    resumeData: {
      fileName: { type: String, default: "", trim: true },
      parsedAt: Date,
      name: { type: String, default: "", trim: true },
      email: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      skills: { type: [String], default: [] },
      education: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      textPreview: { type: String, default: "", maxlength: 2000 }
    },
    internshipPreferences: {
      desiredRole: { type: String, default: "Software Developer Intern", trim: true, maxlength: 100 },
      locationPreference: { type: String, default: "", trim: true, maxlength: 100 },
      workMode: {
        type: String,
        enum: ["Any", "Remote", "Hybrid", "On-site"],
        default: "Any"
      },
      experienceLevel: {
        type: String,
        enum: ["Beginner", "Entry Level", "Intermediate"],
        default: "Entry Level"
      }
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    badges: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
