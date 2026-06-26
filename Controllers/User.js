const User = require("../Models/User");

module.exports.renderSignupForm = async (req, res) => {
  res.render("./users/signupUser.ejs");
};

module.exports.postSignup = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;

    const newUser = new User({
      username,
      email,
      phone,
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to Airbnb!");

      return req.session.save((err) => {
        if (err) return next(err);
        return res.redirect("/listings");
      });
    });
  } catch (err) {
    let message = "Something went wrong";

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];

      if (field === "email") {
        message = "Email already registered!";
      } else if (field === "phone") {
        message = "Phone number already registered!";
      } else {
        message = `${field} already exists!`;
      }
    } else {
      message = err.message;
    }

    req.flash("error", message);

    return req.session.save((err2) => {
      if (err2) return next(err2);
      return res.redirect("/signup");
    });
  }
};

module.exports.renderLoginForm = async (req, res) => {
  res.render("./users/loginUser.ejs");
};

module.exports.postLogin = async (req, res) => {
  req.flash("success", "Welcome to Airbnb");
  const redirectUrl = res.locals.redirectUrl
    ? res.locals.redirectUrl
    : "/listings";
  return req.session.save((err) => {
    if (err) return next(err);
    res.redirect(redirectUrl);
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
      return res.redirect("/listings");
    }
    req.flash("success", "You have been successfully logged out!");
    return req.session.save((err) => {
      if (err) return next(err);
      res.redirect("/listings");
    });
  });
};