require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const ownerModel = require("./models/owner-model");

const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scatch";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB at:", mongoURI);
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully.\n");

    // 1. Clear existing collections for a clean seed
    console.log("Cleaning old sample data...");
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await ownerModel.deleteMany({});

    // 2. Seed Owner/Admin
    console.log("Creating Owner account...");
    const ownerSalt = await bcrypt.genSalt(10);
    const ownerHashedPassword = await bcrypt.hash("adminpassword123", ownerSalt);
    const owner = await ownerModel.create({
      fullname: "Admin Scatch",
      email: "admin@scatch.com",
      password: ownerHashedPassword,
      isAdmin: true,
      contact: 9876543210,
    });
    console.log("✓ Owner created: admin@scatch.com (password: adminpassword123)");

    // 3. Seed Products using existing assets from public/images
    console.log("\nSeeding Products from public/images...");
    const imageDir = path.join(__dirname, "public", "images");

    const sampleProducts = [
      {
        filename: "kaalabasta.png",
        name: "Obsidian Classic Backpack",
        price: 3499,
        discount: 300,
        bgcolor: "#e2e8f0",
        panelcolor: "#1e293b",
        textcolor: "#ffffff",
      },
      {
        filename: "brownbora.png",
        name: "Cognac Heritage Tote",
        price: 4299,
        discount: 500,
        bgcolor: "#fed7aa",
        panelcolor: "#78350f",
        textcolor: "#ffffff",
      },
      {
        filename: "maroonbasta.png",
        name: "Maroon Royale Haversack",
        price: 3899,
        discount: 400,
        bgcolor: "#fecdd3",
        panelcolor: "#881337",
        textcolor: "#ffffff",
      },
      {
        filename: "neelabasta.png",
        name: "Midnight Azure Daypack",
        price: 3199,
        discount: 250,
        bgcolor: "#bfdbfe",
        panelcolor: "#1e3a8a",
        textcolor: "#ffffff",
      },
      {
        filename: "safedbora.png",
        name: "Arctic Canvas Duffel",
        price: 2899,
        discount: 200,
        bgcolor: "#f3f4f6",
        panelcolor: "#374151",
        textcolor: "#ffffff",
      },
      {
        filename: "brownwala.png",
        name: "Uptown Chestnut Satchel",
        price: 4699,
        discount: 600,
        bgcolor: "#ffedd5",
        panelcolor: "#9a3412",
        textcolor: "#ffffff",
      },
      {
        filename: "kaalawala.png",
        name: "Stealth Urban Rucksack",
        price: 3999,
        discount: 350,
        bgcolor: "#cbd5e1",
        panelcolor: "#0f172a",
        textcolor: "#ffffff",
      },
      {
        filename: "bora.png",
        name: "Raw Olive Utility Sack",
        price: 2599,
        discount: 150,
        bgcolor: "#dcfce7",
        panelcolor: "#166534",
        textcolor: "#ffffff",
      },
    ];

    const createdProducts = [];
    for (const prod of sampleProducts) {
      const filePath = path.join(imageDir, prod.filename);
      let imageBuffer;
      if (fs.existsSync(filePath)) {
        imageBuffer = fs.readFileSync(filePath);
      } else {
        // Fallback 1x1 transparent PNG buffer
        imageBuffer = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          "base64"
        );
      }

      const created = await productModel.create({
        image: imageBuffer,
        name: prod.name,
        price: prod.price,
        discount: prod.discount,
        bgcolor: prod.bgcolor,
        panelcolor: prod.panelcolor,
        textcolor: prod.textcolor,
      });

      createdProducts.push(created);
      console.log(`✓ Added Product: "${prod.name}" (₹${prod.price})`);
    }

    // 4. Seed Demo Customer User (with 2 items in cart)
    console.log("\nCreating Demo Customer account...");
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash("password123", userSalt);

    const user = await userModel.create({
      fullname: "Demo Customer",
      email: "user@scatch.com",
      password: userHashedPassword,
      cart: [createdProducts[0]._id, createdProducts[1]._id],
      contact: 9123456780,
    });
    console.log("✓ Customer created: user@scatch.com (password: password123)");
    console.log(`✓ Cart preloaded with 2 items ("${createdProducts[0].name}", "${createdProducts[1].name}")`);

    console.log("\n==========================================");
    console.log("       DATABASE SEEDING COMPLETE!        ");
    console.log("==========================================");
    console.log("Demo Credentials:");
    console.log("Customer Login (/):");
    console.log("  Email:    user@scatch.com");
    console.log("  Password: password123\n");
    console.log("Owner Login (/owners/login):");
    console.log("  Email:    admin@scatch.com");
    console.log("  Password: adminpassword123");
    console.log("==========================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed with error:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
