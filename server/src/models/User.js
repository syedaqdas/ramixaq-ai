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
    website: {
      type: String,
      default: "",
      trim: true
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
