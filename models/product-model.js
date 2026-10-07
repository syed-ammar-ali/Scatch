const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  image: {
    type: Buffer,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  bgcolor: {
    type: String,
    default: "#f4f4f5",
  },
  panelcolor: {
    type: String,
    default: "#ffffff",
  },
  textcolor: {
    type: String,
    default: "#000000",
  },
}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);

