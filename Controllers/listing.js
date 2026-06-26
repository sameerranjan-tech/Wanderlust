const Listing = require("../Models/Listing");
const User = require("../Models/User");

module.exports.index = async (req, res) => {
  let user;
  if (req.user) {
    user = await User.findById(req.user._id);
  }

  let { category = "", sort = "", search = "" } = req.query;
  category = category.trim();
  search = search.trim();
  sort = sort.trim();
  let query = {};
  let sortQuery;
  let listings;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (sort) {
    switch (sort) {
      case "latest":
        sortQuery = { createdAt: -1 };
        break;
      case "priceLow":
        sortQuery = { price: 1 };
        break;
      case "priceHigh":
        sortQuery = { price: -1 };
        break;
      default:
        break;
    }
  }
  listings = await Listing.find(query).sort(sortQuery);

  const wishlists = new Set();
  if (user) {
    for (let wishlist of user.wishlists) {
      wishlists.add(wishlist.toString());
    }
  }

  res.render("./listings/index.ejs", {
    listings,
    sort,
    category,
    search,
    wishlists,
  });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      options: {
        sort: { createdAt: -1 },
      },
      populate: {
        path: "owner",
      },
    })
    .populate("owner");

  let user;
  if (req.user) {
    user = await User.exists({
      _id: req.user._id,
      wishlists: id,
    });
  }

  let wished = false;
  if (user) {
    wished = true;
  }

  if (!listing) {
    req.flash("error", "Listing you are searching for does not exists.");
    return req.session.save((err2) => {
      if (err2) return next(err2);
      return res.redirect("/listings");
    });
  }

  res.render("./listings/listing.ejs", { listing, wished });
};

module.exports.myListings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("./listings/myListings.ejs", { listings });
};

module.exports.GetMyWishlists = async (req, res) => {
  let wishlistsIds = await User.findById(req.user._id).select("wishlists");

  const listings = await Listing.find({ _id: { $in: wishlistsIds.wishlists } });

  res.render("./listings/myWishlists.ejs", { listings });
};

module.exports.myWishlist = async (req, res) => {
  let { id } = req.params;

  const exists = await User.exists({
    _id: req.user._id,
    wishlists: id,
  });

  if (!exists) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlists: id },
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlists: id },
    });
  }
  res.redirect(req.get("Referer") || "/listings");
};

module.exports.renderNewListingForm = (req, res) => {
  res.render("./listings/newListing.ejs");
};

module.exports.postNewListing = async (req, res) => {
  let listing = req.body.listing;

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  listing.owner = req.user;
  await Listing.create(listing);

  req.flash("success", "New Listing Created");
  return req.session.save((err2) => {
    if (err2) return next(err2);
    res.redirect("/listings");
  });
};

module.exports.renderEditListingForm = async (req, res) => {
  let { id } = req.params;
  // const listing = await Listing.findById(id);
  // After
const listing = await Listing.findById(id).populate("owner");

  let originalImage = listing.image.url;
  originalImage = originalImage.replace("/upload", "/upload/w_250,e_blur:200");
  listing.image.url = originalImage;

  if (!listing) {
    req.flash("error", "Listing you are searching for does not exists.");
    return req.session.save((err2) => {
      if (err2) return next(err2);
      return res.redirect("/listings");
    });
  }

  res.render("./listings/editListing.ejs", { listing });
};

module.exports.patchEditListing = async (req, res) => {
  let { id } = req.params;

  let listing = req.body.listing;

  if (req.file) {
    listing.image = {
      filename: req.file.filename,
      url: req.file.path,
    };
  }

  await Listing.findByIdAndUpdate(id, listing);

  req.flash("success", "Listing Updated");
  return req.session.save((err2) => {
    if (err2) return next(err2);
    res.redirect(`/listings/${id}`);
  });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  return req.session.save((err2) => {
    if (err2) return next(err2);
    res.redirect("/listings");
  });
};