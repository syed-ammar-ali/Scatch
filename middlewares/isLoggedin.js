const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
  if (!req.cookies || !req.cookies.token) {
    req.flash("error", "You need to login first");
    return res.redirect("/");
  }
  try {
    const secret = process.env.JWT_KEY || "scatch_jwt_secret_default_key";
    let decoded = jwt.verify(req.cookies.token, secret);
    let user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      res.clearCookie("token");
      req.flash("error", "User not found. Please login again.");
      return res.redirect("/");
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    req.flash("error", "Session expired or invalid. Please login again.");
    return res.redirect("/");
  }
};

