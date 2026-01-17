const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protectVendor } = require("../middleware/vendorMiddleware");
const { productCache, invalidateCache } = require("../config/cache");
const {
  cacheListMiddleware,
  cacheByIdMiddleware,
} = require("../middleware/cacheMiddleware");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get(
  "/",
  cacheListMiddleware(productCache, "products:list"),
  async (req, res) => {
    try {
      const keyword = req.query.keyword
        ? {
            name: {
              $regex: req.query.keyword,
              $options: "i",
            },
          }
        : {};

      const category = req.query.category
        ? { category: req.query.category }
        : {};

      let priceFilter = {};
      if (req.query.minPrice || req.query.maxPrice) {
        priceFilter.price = {};
        if (req.query.minPrice)
          priceFilter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice)
          priceFilter.price.$lte = Number(req.query.maxPrice);
      }

      // Simplified query using computed isPublic field (fast with index)
      const query = {
        isPublic: true,
        ...keyword,
        ...category,
        ...priceFilter,
      };

      let sort = {};
      if (req.query.sort) {
        if (req.query.sort === "price-asc") sort = { price: 1 };
        else if (req.query.sort === "price-desc") sort = { price: -1 };
        else if (req.query.sort === "newest") sort = { createdAt: -1 };
      }

      const products = await Product.find(query)
        .sort(sort)
        .populate("vendor", "businessName")
        .lean();
      res.json(products);
    } catch (error) {
      console.error("Product query error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get(
  "/:id",
  cacheByIdMiddleware(productCache, "products:detail"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    // Clear product cache when new product is created
    invalidateCache.products();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      // Clear product cache when product is updated
      invalidateCache.products();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      // Clear product cache when product is deleted
      invalidateCache.products();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post("/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      // Clear product cache when review is added
      invalidateCache.products();

      // Get the newly added review with its _id
      const newReview = product.reviews[product.reviews.length - 1];

      // Emit real-time event
      if (req.io) {
        req.io.emit("new_review", {
          productId: product._id,
          review: newReview,
          rating: product.rating,
        });
      }

      res.status(201).json({
        message: "Review added",
        review: newReview,
        rating: product.rating,
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @desc    Reply to review (Vendor)
// @route   PUT /api/products/:id/reviews/:reviewId/reply
// @access  Private/Vendor
router.put("/:id/reviews/:reviewId/reply", protectVendor, async (req, res) => {
  const { reply } = req.body;
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (
        product.vendor &&
        product.vendor.toString() !== req.vendor._id.toString()
      ) {
        return res.status(401).json({
          message: "Not authorized to reply to this product's reviews",
        });
      }

      const review = product.reviews.id(req.params.reviewId);
      if (review) {
        review.vendorReply = reply;
        review.vendorReplyDate = Date.now();
        await product.save();
        // Clear product cache when vendor replies to review
        invalidateCache.products();

        // Emit real-time event
        if (req.io) {
          req.io.emit("review_reply", {
            productId: product._id,
            reviewId: review._id,
            reply: reply,
            replyDate: review.vendorReplyDate,
          });
        }

        res.json({ message: "Reply added" });
      } else {
        res.status(404).json({ message: "Review not found" });
      }
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
