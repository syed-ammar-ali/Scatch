const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  res.send("heys");
});

router.post("/register", async function (req, res) {
  try {
    let { fullname, email, password } = req.body;
    let user = await userModel.create({
      fullname,
      email,
      password,
    });
    res.send(user);
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
