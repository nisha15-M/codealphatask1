const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Books",
        "Electronics",
        "Lab Equipment",
        "Furniture",
        "Clothing",
        "Sports",
        "Stationery",
        "Other",
      ],
    },
    // Unique feature: not just "buy" - free giveaways and swaps are first-class
    listingType: {
      type: String,
      enum: ["sell", "free", "exchange"],
      default: "sell",
      required: true,
    },
    price: {
      type: Number,
      default: 0, // 0 when listingType is "free" or "exchange"
      min: 0,
    },
    exchangeFor: {
      type: String, // e.g. "Looking to swap for a scientific calculator"
      trim: true,
      default: "",
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Used", "Heavily Used"],
      required: true,
    },
    images: [{ type: String }], // image URLs
    // Unique feature: urgency helps buyers who need something before an exam/deadline
    urgent: {
      type: Boolean,
      default: false,
    },
    // Unique feature: predefined on-campus meetup points instead of shipping
    meetupPoint: {
      type: String,
      enum: [
        "Library",
        "Main Gate",
        "Hostel Block A",
        "Hostel Block B",
        "Canteen",
        "Academic Block",
        "Sports Complex",
        "Other",
      ],
      default: "Main Gate",
    },
    college: {
      type: String,
      required: true, // listings are scoped to the seller's campus
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "reserved", "sold", "archived"],
      default: "active",
    },
    // Unique feature: listings auto-archive at semester end to keep marketplace fresh
    semesterTag: {
      type: String, // e.g. "Fall2026"
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
