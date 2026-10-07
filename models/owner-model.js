const mongoose = require("mongoose");

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  products: {
    type: Array,
    default: [],
  },
  contact: Number,
  picture: String,
  gstin: String,
}, { timestamps: true });

module.exports = mongoose.model("owner", ownerSchema);

