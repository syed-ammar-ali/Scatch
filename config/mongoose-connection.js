const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

let mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  try {
    mongoURI = config.has("MONGODB_URI") ? config.get("MONGODB_URI") : "mongodb://127.0.0.1:27017";
  } catch (err) {
    mongoURI = "mongodb://127.0.0.1:27017";
  }
}

if (!mongoURI.endsWith("/scatch") && !mongoURI.includes("/scatch?")) {
  mongoURI = mongoURI.replace(/\/+$/, "") + "/scatch";
}

mongoose
  .connect(mongoURI)
  .then(function () {
    dbgr("Connected to MongoDB");
    console.log("Connected to MongoDB");
  })
  .catch(function (err) {
    dbgr(err);
    console.error("MongoDB connection error:", err.message);
  });

module.exports = mongoose.connection;

