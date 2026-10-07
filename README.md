# Scatch — Interactive Bespoke Product Studio

> **AI Context & Hand-off Note**: This README is structured to provide any AI agent or developer with complete context on the application's current state, architecture, technical quirks, and planned evolution into an interactive product customizer studio.

---

## 1. Project Overview

**Scatch** is a full-stack e-commerce web application built on Node.js, Express, MongoDB, and EJS. 

Historically conceived as an online boutique for designer bags, the project is evolving into an **Interactive Bespoke Configurator / Custom Product Studio** (e.g., Custom Mechanical Keyboards, Sneakers, Luxury Watches, or Designer Leather Goods). Instead of a standard static catalog, customers interact with a live visual configurator to customize materials, colors, accents, and personal engravings/monograms in real time before checkout.

---

## 2. Tech Stack

- **Runtime & Server**: Node.js, Express.js (`4.21.x`)
- **Database & ODM**: MongoDB with Mongoose (`8.7.x`)
- **Templating**: EJS (`3.1.x`) server-side rendering
- **Authentication**: JWT (`jsonwebtoken`) stored in HTTP cookies (`cookie-parser`), password hashing with `bcrypt`
- **File Uploads**: `multer` (currently storing image buffers directly in MongoDB documents)
- **Sessions & Flash**: `express-session`, `connect-flash`
- **Configuration & Environment**: `dotenv`, `config`

---

## 3. Project Structure & Key Files

```text
Scatch/
├── app.js                          # Express setup, middleware pipeline, route mounting
├── package.json                    # Dependencies and metadata
├── config/
│   ├── mongoose-connection.js      # MongoDB connection via debug and config
│   └── multer-config.js            # In-memory multer storage for file uploads
├── controllers/
│   └── authController.js           # registerUser, loginUser, logoutUser logic
├── middlewares/
│   └── isLoggedin.js               # JWT verification middleware protecting user routes
├── models/
│   ├── user-model.js               # User schema (fullname, email, password, cart[], orders[])
│   ├── product-model.js            # Product schema (name, price, discount, image buffer, bgcolor, panelcolor, textcolor)
│   └── owner-model.js              # Platform admin/owner schema
├── routes/
│   ├── index.js                    # Landing page, /shop, /cart, /addtocart/:productId
│   ├── usersRouter.js              # Auth endpoints (/register, /login, /logout)
│   ├── ownersRouter.js             # Owner setup (/create) and admin panel (/admin)
│   └── productsRouter.js           # Product creation endpoint (/products/create)
├── views/                          # EJS templates
│   ├── index.ejs                   # Guest landing / login & registration forms
│   ├── shop.ejs                    # Product catalog listing
│   ├── cart.ejs                    # Shopping cart & checkout summary
│   ├── createproducts.ejs          # Admin product creation form
│   ├── admin.ejs                   # Admin dashboard layout
│   └── partials/                   # Reusable EJS header & footer partials
└── public/                         # Static assets (stylesheets, images, scripts)
```

---

## 4. Current State & Known Gotchas (Technical Debt)

Any AI assisting with this project should be aware of the following baseline details:

1. **Cart Calculation Limitation**:
   - In [`routes/index.js`](file:///c:/Users/syeda/Desktop/Web%20Dev/Scatch/routes/index.js), the `/cart` route currently computes the bill only for `user.cart[0]`. It needs refactoring to support multi-item quantities, dynamic totals, taxes, and discounts across all cart items.
2. **Image Storage**:
   - In [`routes/productsRouter.js`](file:///c:/Users/syeda/Desktop/Web%20Dev/Scatch/routes/productsRouter.js) and [`models/product-model.js`](file:///c:/Users/syeda/Desktop/Web%20Dev/Scatch/models/product-model.js), images are stored as raw `Buffer` binaries inside MongoDB. To scale cleanly, this should transition to Cloudinary or AWS S3 URLs.
3. **Admin Route Protection**:
   - In [`routes/ownersRouter.js`](file:///c:/Users/syeda/Desktop/Web%20Dev/Scatch/routes/ownersRouter.js), `/admin` needs a dedicated owner authentication middleware so unauthorized users cannot access inventory creation.
4. **Color Attributes Already Exist**:
   - [`models/product-model.js`](file:///c:/Users/syeda/Desktop/Web%20Dev/Scatch/models/product-model.js) already contains `bgcolor`, `panelcolor`, and `textcolor`. This provides a natural foundation for real-time visual customizer layers.

---

## 5. Strategic Vision: The "Interactive Bespoke Studio"

The objective is to elevate this app from a basic e-commerce store into a **dynamic, interactive product design studio**:

### Core Flow:
1. **Base Silhouette Selection**: Buyer selects a base model/template.
2. **Interactive Visual Customizer**:
   - A multi-layer SVG or Canvas interface where users customize discrete parts (e.g., base body, accent panels, trim, hardware finish, keycaps, or dials).
   - Real-time monogramming or custom text embossing with instant visual preview.
3. **Dynamic Pricing Calculator**: Base price dynamically updates as premium materials, hardware finishes, or custom text are added.
4. **Bespoke Cart & Order Object**:
   - Cart items store a `CustomizationSpec` object containing selected colors, finishes, custom text, and dynamic price breakdown.
5. **Artisan / Admin Fulfillment**:
   - The admin panel displays an order "Crafting Sheet" with the exact specs and preview snapshot for fulfillment.

### Product Niches Explored:
- **Mechanical Keyboard & Desk Studio**: Cases (aluminum/acrylic/wood), keycap colorways, switch sound profiles, custom braided cables.
- **Custom Sneaker Lab**: Outsoles, midsoles, uppers, accent stripes, heel counter embroidery.
- **Bespoke Luxury Watches**: Cases, bezel inserts, dials, hands, leather/steel straps, engraved casebacks.
- **Designer Bags & Leather Goods**: Body leather, contrast panels, zippers/buckles, gold-foil monogramming.

---

## 6. Implementation Roadmap

### Phase 1: Architecture & Cart Modernization
- [ ] Upgrade the Cart schema: support multiple items, quantities, and item removal.
- [ ] Define the `CustomizationSpec` schema (selected color layers, hardware finishes, monogram text, calculated add-on fees).
- [ ] Create an `Order` model with payment/fulfillment statuses (`pending`, `paid`, `in_crafting`, `shipped`).

### Phase 2: Interactive Studio Frontend
- [ ] Build `/studio/:productId` interactive design canvas using multi-layered SVG or HTML5 Canvas.
- [ ] Implement controls for live color selection, material switching, and custom text rendering.
- [ ] Real-time dynamic price calculator reflecting active customization selections.
- [ ] "Add Custom Piece to Cart" action bundling the design specs.

### Phase 3: Production & Admin Tooling
- [ ] Protect owner routes with an `isOwner` middleware.
- [ ] Create an Order Fulfillment view for store owners with complete design specs and preview renders.
- [ ] Integrate payment processing (Stripe / Razorpay).
- [ ] Migrate image buffer storage to cloud object storage (Cloudinary or S3).

---

## 7. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env:
# PORT=3000
# MONGODB_URI=mongodb://127.0.0.1:27017/scatch
# JWT_KEY=your_jwt_secret
# EXPRESS_SESSION_SECRET=your_session_secret
# NODE_ENV=development

# 3. Start development server
npm run dev # or nodemon app.js
```
