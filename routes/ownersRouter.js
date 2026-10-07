const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");
const isOwner = require("../middlewares/isOwner");

router.get("/login", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("owner-login", { error, success, loggedIn: false });
});

router.get("/register", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  res.render("owner-login", { error, success, loggedIn: false });
});

const handleOwnerRegistration = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;

    if (!fullname || !email || !password || !fullname.trim() || !email.trim() || !password.trim()) {
      req.flash("error", "All fields are required");
      return res.redirect("/owners/login");
    }

    let owners = await ownerModel.find();
    if (owners.length > 0) {
      req.flash("error", "Owner already exists. Only one owner account is permitted.");
      return res.status(403).redirect("/owners/login");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let createdOwner = await ownerModel.create({
      fullname: fullname.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
    });

    const secret = process.env.JWT_KEY || "scatch_jwt_secret_default_key";
    let token = jwt.sign({ email: createdOwner.email, id: createdOwner._id }, secret, {
      expiresIn: "7d",
    });

    res.cookie("ownerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.flash("success", "Owner account created successfully!");
    res.redirect("/owners/admin");
  } catch (err) {
    console.error("Owner creation error:", err);
    req.flash("error", "Failed to create owner account");
    res.redirect("/owners/login");
  }
};

router.post("/create", handleOwnerRegistration);
router.post("/register", handleOwnerRegistration);

router.post("/login", async function (req, res) {
  try {
    let { email, password } = req.body;

    if (!email || !password || !email.trim() || !password.trim()) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/owners/login");
    }

    let owner = await ownerModel.findOne({ email: email.trim().toLowerCase() });
    if (!owner) {
      req.flash("error", "Invalid owner credentials");
      return res.redirect("/owners/login");
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      req.flash("error", "Invalid owner credentials");
      return res.redirect("/owners/login");
    }

    const secret = process.env.JWT_KEY || "scatch_jwt_secret_default_key";
    let token = jwt.sign({ email: owner.email, id: owner._id }, secret, {
      expiresIn: "7d",
    });

    res.cookie("ownerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.flash("success", "Logged in as Owner successfully!");
    res.redirect("/owners/admin");
  } catch (err) {
    console.error("Owner login error:", err);
    req.flash("error", "Something went wrong during owner login");
    res.redirect("/owners/login");
  }
});

router.get("/logout", function (req, res) {
  res.clearCookie("ownerToken");
  req.flash("success", "Logged out from owner dashboard");
  res.redirect("/owners/login");
});

router.get("/admin", isOwner, function (req, res) {
  let success = req.flash("success");
  let error = req.flash("error");
  res.render("createproducts", {
    success,
    error,
    loggedIn: true,
    activePage: "admin",
  });
});

module.exports = router;

