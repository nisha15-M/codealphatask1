const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    // Unique feature: trust score built from completed transactions + ratings
    trustScore: {
      type: Number,
      default: 50, // starts neutral, moves up/down with behavior
      min: 0,
      max: 100,
    },
    ratingsSum: {
      type: Number,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false, // set true once college email is confirmed
    },
  },
  { timestamps: true }
);

// Virtual for average rating, avoids storing a derived value directly
userSchema.virtual("averageRating").get(function () {
  if (this.ratingsCount === 0) return null;
  return Number((this.ratingsSum / this.ratingsCount).toFixed(1));
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
