const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("index", { error, success, loggedIn: false, activePage: "home" });
});

router.get("/cart", isLoggedin, async function (req, res) {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    // Filter out any populated items that might have been deleted from DB
    user.cart = (user.cart || []).filter((item) => item !== null);

    let totalMRP = 0;
    let totalDiscount = 0;
    user.cart.forEach((item) => {
      totalMRP += Number(item.price) || 0;
      totalDiscount += Number(item.discount) || 0;
    });

    const platformFee = user.cart.length > 0 ? 20 : 0;
    const net = Math.max(0, totalMRP - totalDiscount);
    const bill = net + platformFee;

    res.render("cart", {
      user,
      bill,
      net,
      totalMRP,
      totalDiscount,
      platformFee,
      activePage: "cart",
      loggedIn: true,
    });
  } catch (err) {
    console.error("Cart error:", err);
    req.flash("error", "Failed to load cart");
    res.redirect("/shop");
  }
});

const handleAddToCart = async function (req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      req.flash("error", "Invalid product ID");
      return res.redirect("/shop");
    }

    const product = await productModel.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/shop");
    }

    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    user.cart.push(productId);
    await user.save();

    req.flash("success", "Added to cart successfully!");
    res.redirect("/shop");
  } catch (err) {
    console.error("Add to cart error:", err);
    req.flash("error", "Could not add product to cart");
    res.redirect("/shop");
  }
};

router.get("/addtocart/:productId", isLoggedin, handleAddToCart);
router.post("/addtocart/:productId", isLoggedin, handleAddToCart);

router.get("/removefromcart/:productId", isLoggedin, async function (req, res) {
  try {
    const { productId } = req.params;
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    const index = user.cart.indexOf(productId);
    if (index > -1) {
      user.cart.splice(index, 1);
      await user.save();
      req.flash("success", "Item removed from cart");
    }
    res.redirect("/cart");
  } catch (err) {
    console.error("Remove from cart error:", err);
    req.flash("error", "Could not remove item from cart");
    res.redirect("/cart");
  }
});

router.get("/shop", isLoggedin, async function (req, res) {
  try {
    let sortQuery = {};
    if (req.query.sortby === "newest") {
      sortQuery = { _id: -1 };
    }

    let products = await productModel.find().sort(sortQuery);
    let success = req.flash("success");
    let error = req.flash("error");
    res.render("shop", {
      products,
      success,
      error,
      activePage: "shop",
      loggedIn: true,
    });
  } catch (err) {
    console.error("Shop error:", err);
    req.flash("error", "Failed to load shop items");
    res.render("shop", {
      products: [],
      success: [],
      error: ["Failed to load shop products"],
      activePage: "shop",
      loggedIn: true,
    });
  }
});

module.exports = router;

