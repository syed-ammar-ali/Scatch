const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const secret = process.env.JWT_KEY || "scatch_jwt_secret_default_key";
  return jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "7d",
  });
};

module.exports.generateToken = generateToken;