const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
  const token = req.cookies.ownerToken || req.cookies.token;
  if (!token) {
    req.flash("error", "Owner login required to access this page");
    return res.redirect("/owners/login");
  }

  try {
    const secret = process.env.JWT_KEY || "scatch_jwt_secret_default_key";
    const decoded = jwt.verify(token, secret);

    const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
    if (!owner) {
      req.flash("error", "Owner privileges required");
      return res.redirect("/owners/login");
    }

    req.owner = owner;
    next();
  } catch (err) {
    req.flash("error", "Invalid or expired session. Please login as owner.");
    res.redirect("/owners/login");
  }
};
