const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwner = require("../middlewares/isOwner");

router.post("/create", isOwner, upload.single("image"), async function (req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      req.flash("error", "Product image is required");
      return res.redirect("/owners/admin");
    }

    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    if (!name || !price || !name.trim()) {
      req.flash("error", "Product name and price are required");
      return res.redirect("/owners/admin");
    }

    const numericPrice = Number(price);
    const numericDiscount = Number(discount) || 0;

    if (isNaN(numericPrice) || numericPrice < 0) {
      req.flash("error", "Price must be a valid positive number");
      return res.redirect("/owners/admin");
    }

    if (isNaN(numericDiscount) || numericDiscount < 0) {
      req.flash("error", "Discount must be a valid positive number");
      return res.redirect("/owners/admin");
    }

    await productModel.create({
      image: req.file.buffer,
      name: name.trim(),
      price: numericPrice,
      discount: numericDiscount,
      bgcolor: bgcolor ? bgcolor.trim() : "#f4f4f5",
      panelcolor: panelcolor ? panelcolor.trim() : "#ffffff",
      textcolor: textcolor ? textcolor.trim() : "#000000",
    });

    req.flash("success", "Product created successfully!");
    res.redirect("/owners/admin");
  } catch (err) {
    console.error("Product creation error:", err);
    req.flash("error", err.message || "Failed to create product");
    res.redirect("/owners/admin");
  }
});

router.get("/delete/:id", isOwner, async function (req, res) {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully");
    res.redirect("/owners/admin");
  } catch (err) {
    console.error("Product deletion error:", err);
    req.flash("error", "Failed to delete product");
    res.redirect("/owners/admin");
  }
});

module.exports = router;

