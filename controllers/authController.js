const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;

    if (!fullname || !email || !password || !fullname.trim() || !email.trim() || !password.trim()) {
      req.flash("error", "All fields are required");
      return res.redirect("/");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      req.flash("error", "Please provide a valid email address");
      return res.redirect("/");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long");
      return res.redirect("/");
    }

    let existingUser = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      req.flash("error", "User already exists with this email");
      return res.redirect("/");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let user = await userModel.create({
      fullname: fullname.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
    });

    let token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.flash("success", "Account created successfully!");
    res.redirect("/shop");
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("error", "Something went wrong during registration");
    res.redirect("/");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    if (!email || !password || !email.trim() || !password.trim()) {
      req.flash("error", "Please provide email and password");
      return res.redirect("/");
    }

    let user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/");
    }

    let token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.flash("success", "Logged in successfully");
    res.redirect("/shop");
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Something went wrong during login");
    res.redirect("/");
  }
};

module.exports.logoutUser = function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
};

