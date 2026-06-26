

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");  
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// Change it back to this:
const MongoStore = require("connect-mongo").default;


console.log(MongoStore);

const flash = require("connect-flash");

// Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/User.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/User.js");

// Use fallback connection strings defensively to prevent internal wrapper crashes
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust"; 
const secretString = process.env.SECRET || "fallbackdevelopmentsecretstring";

// here we are calling main function
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: secretString,
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => { // Added 'err' parameter here
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: secretString,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,   //used for security purpose - used to prevent Cross-Scripting attacks 
  },
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 1. Session
app.use(session(sessionOptions));

// 2. Flash
app.use(flash());

// 3. Passport
// 3. Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Add these 3 lines right here 👇
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());     // <--- Fixes the serialization error!
passport.deserializeUser(User.deserializeUser()); // <--- Prevents the deserialization error!

// ⭐ 4. Locals middleware — MUST be here
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.category = req.query.category || "";
  res.locals.sort = req.query.sort || "";
  next();
});

// 5. Routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });

// app.all(/.*/, (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong!" } = err;
    
    // Pass 'err' as a key in the data object so EJS can see it
    res.status(status).render("error.ejs", { err }); 
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});