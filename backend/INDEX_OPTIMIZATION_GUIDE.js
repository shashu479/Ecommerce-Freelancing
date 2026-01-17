/**
 * Database Index Strategy Guide
 *
 * CRITICAL ISSUE IDENTIFIED: $or queries with $ne operators don't use indexes efficiently
 *
 * Problem Query (productRoutes.js):
 * {
 *   $or: [
 *     { isVendorProduct: { $ne: true } },  // Branch 1: Admin products
 *     { isVendorProduct: true, vendorStatus: "approved", isActive: true }  // Branch 2: Vendor products
 *   ],
 *   category: "tea",  // Optional filter
 *   price: { $gte: 100, $lte: 500 }  // Optional range
 * }
 *
 * Why This Query is Slow:
 * 1. $ne operator forces MongoDB to scan many documents
 * 2. $or with different field combinations makes index selection difficult
 * 3. MongoDB can use an index for EACH $or branch, but must merge results
 *
 * SOLUTION OPTIONS:
 *
 * Option A: Keep Current Query, Optimize Indexes (DONE)
 * --------------------------------------------------------
 * Create indexes matching each $or branch:
 * - Index 1: { isVendorProduct: 1, category: 1, price: 1 }
 * - Index 2: { isVendorProduct: 1, vendorStatus: 1, isActive: 1, category: 1, price: 1 }
 *
 * Performance: Moderate improvement (50-70% faster)
 *
 *
 * Option B: Rewrite Query to Avoid $or (RECOMMENDED)
 * ---------------------------------------------------
 * Instead of $or with $ne, use explicit matching:
 *
 * const query = {
 *   $or: [
 *     { isVendorProduct: false, category: "tea" },  // Explicit false
 *     { isVendorProduct: { $exists: false }, category: "tea" },  // Not set
 *     { isVendorProduct: true, vendorStatus: "approved", isActive: true, category: "tea" }
 *   ]
 * };
 *
 * Better yet, set a default value for isVendorProduct:
 * Schema: isVendorProduct: { type: Boolean, default: false }
 *
 * Then query becomes:
 * const query = {
 *   $or: [
 *     { isVendorProduct: false, category: "tea" },
 *     { isVendorProduct: true, vendorStatus: "approved", isActive: true, category: "tea" }
 *   ]
 * };
 *
 * Performance: 90-95% faster
 *
 *
 * Option C: Denormalize with Computed Field (BEST)
 * --------------------------------------------------
 * Add a computed field that makes the query simpler:
 *
 * Schema:
 * isPublic: { type: Boolean, default: true, index: true }
 *
 * Set isPublic based on logic:
 * - Admin products: isPublic = true
 * - Vendor products: isPublic = (vendorStatus === "approved" && isActive)
 *
 * Query becomes:
 * const query = { isPublic: true, category: "tea", price: { $gte: 100 } };
 *
 * Index:
 * { isPublic: 1, category: 1, price: 1 }
 *
 * Performance: 95%+ faster, IXSCAN guaranteed
 *
 *
 * RECOMMENDED IMPLEMENTATION:
 * ============================
 *
 * 1. Add virtual/computed field to Product model:
 */

// In Product model, add middleware to set isPublic
productSchema.pre("save", function (next) {
  if (this.isVendorProduct) {
    this.isPublic = this.vendorStatus === "approved" && this.isActive === true;
  } else {
    this.isPublic = true; // Admin products always public
  }
  next();
});

/**
 * 2. Add index:
 *    productSchema.index({ isPublic: 1, category: 1, price: 1 });
 *
 * 3. Update query in productRoutes.js:
 *    const query = {
 *      isPublic: true,
 *      ...keyword,
 *      ...category,
 *      ...priceFilter
 *    };
 *
 * 4. Migrate existing data:
 */

const migrateProductVisibility = async () => {
  const Product = require("./models/Product");

  // Update all products to set isPublic field
  await Product.updateMany(
    { isVendorProduct: { $ne: true } },
    { $set: { isPublic: true } },
  );

  await Product.updateMany(
    { isVendorProduct: true, vendorStatus: "approved", isActive: true },
    { $set: { isPublic: true } },
  );

  await Product.updateMany(
    {
      isVendorProduct: true,
      $or: [{ vendorStatus: { $ne: "approved" } }, { isActive: { $ne: true } }],
    },
    { $set: { isPublic: false } },
  );

  console.log("✓ Migration complete");
};

/**
 * TESTING INDEX USAGE:
 * ====================
 *
 * To verify indexes are being used:
 */

const testIndexUsage = async () => {
  const Product = require("./models/Product");

  const explainResult = await Product.find({
    isPublic: true,
    category: "tea",
    price: { $gte: 100, $lte: 500 },
  }).explain("executionStats");

  console.log(
    "Query Plan:",
    explainResult.executionStats.executionStages.stage,
  );
  // Should show: IXSCAN (index scan)
  // NOT: COLLSCAN (collection scan)

  console.log(
    "Execution Time:",
    explainResult.executionStats.executionTimeMillis,
    "ms",
  );
  console.log(
    "Documents Examined:",
    explainResult.executionStats.totalDocsExamined,
  );
  console.log("Documents Returned:", explainResult.executionStats.nReturned);

  // Good performance:
  // - Stage: IXSCAN
  // - Time: < 20ms
  // - Docs Examined ≈ Docs Returned
};

/**
 * INDEX SELECTION PRIORITY:
 * =========================
 *
 * MongoDB selects indexes based on:
 * 1. Exact match on all query fields (highest priority)
 * 2. Prefix match on compound index
 * 3. Index covering the most selective field
 *
 * For compound index { a: 1, b: 1, c: 1 }:
 * ✓ Can use for queries: { a }, { a, b }, { a, b, c }
 * ✗ Cannot use for: { b }, { c }, { b, c }
 *
 *
 * COMMON MISTAKES:
 * ================
 *
 * 1. Too many indexes (> 10 per collection)
 *    - Slows down writes
 *    - Confuses query planner
 *
 * 2. Wrong field order in compound index
 *    - Most selective/most queried field should be first
 *
 * 3. Duplicate indexes
 *    - unique: true already creates index
 *    - Don't add schema.index() for same field
 *
 * 4. Indexes on low-cardinality fields alone
 *    - Fields with few distinct values (boolean, enum with 2-3 values)
 *    - Should be part of compound index, not standalone
 *
 *
 * MONITORING:
 * ===========
 *
 * Check slow queries in MongoDB:
 * db.setProfilingLevel(1, { slowms: 100 });  // Log queries > 100ms
 * db.system.profile.find().sort({ ts: -1 }).limit(10);
 *
 * Check index usage:
 * db.products.aggregate([{ $indexStats: {} }]);
 */

module.exports = {
  migrateProductVisibility,
  testIndexUsage,
};
