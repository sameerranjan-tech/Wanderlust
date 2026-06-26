const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../Models/Listing.js");
const Review = require("../Models/Review.js");

const wrapAsync = require("../utils/wrapAsync.js");

const { reviewSchema } = require("../validators/reviewSchema.js");
const { validate } = require("../validators/validate.js");
const { isLoggedIn, isOwnerReview } = require("../middleware.js");

const reviewController = require("../Controllers/review.js");

// Review
router.post(
  "/",
  validate(reviewSchema),
  isLoggedIn,
  wrapAsync(reviewController.postNewReview),
);

// Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isOwnerReview,
  wrapAsync(reviewController.destroyReview),
);

module.exports = router;