const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedIn: false, activePage: "home" });
});

router.get("/cart", isLoggedin, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");
  const bill = Number(user.cart[0].price) + 20 - Number(user.cart[0].discount);
  const net = Number(user.cart[0].price) - Number(user.cart[0].discount);
  res.render("cart", { user, bill, net, currentPage: "cart" });
});

router.get("/addtocart/:productId", isLoggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.productId);
  await user.save();
  req.flash("success", "added to cart");
  res.redirect("/shop");
});

router.get("/shop", isLoggedin, async function (req, res) {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success, currentPage: "shop" });
});

module.exports = router;
