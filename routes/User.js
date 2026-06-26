const express = require("express");
const router = express.Router();

const userSchema = require("../validators/userSchema.js");
const { validate } = require("../validators/validate.js");
const User = require("../Models/User.js");

const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../Controllers/User.js");

router
  .route("/signup")

  // Signup Form
  .get(wrapAsync(userController.renderSignupForm))

  // POST Signup
  .post(validate(userSchema), wrapAsync(userController.postSignup));

router
  .route("/login")

  // Login Form
  .get(wrapAsync(userController.renderLoginForm))

  // POST Login
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.postLogin),
  );

// LOGOUT
router.get("/logout", userController.logout);

module.exports = router;