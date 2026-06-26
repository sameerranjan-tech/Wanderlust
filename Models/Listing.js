const mongoose = require("mongoose");
const Review = require("./Review.js");
const wrapAsync = require("../utils/wrapAsync.js");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxLength: 200,
  },
  image: {
    filename: {
      type: String,
      default: "listing image",
    },
    url: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/interior-modern-comfortable-hotel-room_1232-1822.jpg",
      set: (v) => {
        return v == ""
          ? "https://img.freepik.com/free-photo/interior-modern-comfortable-hotel-room_1232-1822.jpg"
          : v;
      },
    },
  },
  category: {
    type: String,
    enum: [
      "Beach",
      "Mountain",
      "City",
      "Forest",
      "Snow",
      "Lake",
      "Camping",
      "Historical",
      "Desert",
      "Farm",
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing.reviews.length > 0) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = new mongoose.model("Listing", listingSchema);

module.exports = Listing;