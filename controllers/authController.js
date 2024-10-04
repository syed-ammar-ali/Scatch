const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const ownerModel = require("../models/owner-model");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (user) {
      req.flash("error", "User already exists"); // Flashing the error
      return res.redirect("/"); // Redirect to the registration page
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            fullname,
            email,
            password: hash,
          });
          let token = generateToken(user);
          res.cookie("token", token);
          res.send("user created succesfully");
        }
      });
    });
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Invalid credentials"); // Flashing the error
    return res.redirect("/"); // Redirect back to the login page
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      req.flash("success", "Logged in successfully"); // Flashing success
      res.redirect("/shop");
    } else {
      req.flash("error", "Invalid credentials"); // Flashing the error
      res.redirect("/"); // Redirect back to the login page
    }
  });
};

module.exports.logoutUser = function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
};
