const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default; 
// passport-local-mongoose is responsible for generating the salt and hash password
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    minLength: 10,
    maxLength: 10,
  },
  wishlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;