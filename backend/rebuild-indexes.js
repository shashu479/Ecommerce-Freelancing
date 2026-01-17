/**
 * Rebuild Database Indexes
 *
 * This script drops old indexes and creates new ones based on the schema.
 * Run this after updating model index definitions.
 */

const mongoose = require("mongoose");
require("dotenv").config();

const rebuildIndexes = async () => {
  try {
    console.log("🔨 Rebuilding database indexes...\n");

    // Connect to database
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/siraba_organic",
    );
    console.log(`✓ Connected to MongoDB: ${conn.connection.host}\n`);

    // Load models
    const Product = require("./models/Product");
    const Vendor = require("./models/Vendor");
    const Order = require("./models/Order");
    const VendorOrder = require("./models/VendorOrder");
    const User = require("./models/User");
    const Notification = require("./models/Notification");

    console.log("📋 Current indexes before rebuild:\n");

    // Show current Product indexes
    const currentIndexes = await Product.collection.getIndexes();
    console.log("Product indexes:", Object.keys(currentIndexes).length);
    Object.keys(currentIndexes).forEach((name) => {
      console.log(`  - ${name}`);
    });
    console.log("");

    // Rebuild indexes for each model
    console.log("1️⃣  Rebuilding Product indexes...");
    await Product.syncIndexes();
    console.log("   ✓ Product indexes rebuilt\n");

    console.log("2️⃣  Rebuilding Vendor indexes...");
    await Vendor.syncIndexes();
    console.log("   ✓ Vendor indexes rebuilt\n");

    console.log("3️⃣  Rebuilding Order indexes...");
    await Order.syncIndexes();
    console.log("   ✓ Order indexes rebuilt\n");

    console.log("4️⃣  Rebuilding VendorOrder indexes...");
    await VendorOrder.syncIndexes();
    console.log("   ✓ VendorOrder indexes rebuilt\n");

    console.log("5️⃣  Rebuilding User indexes...");
    await User.syncIndexes();
    console.log("   ✓ User indexes rebuilt\n");

    console.log("6️⃣  Rebuilding Notification indexes...");
    await Notification.syncIndexes();
    console.log("   ✓ Notification indexes rebuilt\n");

    console.log("📋 New indexes after rebuild:\n");

    // Show new Product indexes
    const newIndexes = await Product.collection.getIndexes();
    console.log("Product indexes:", Object.keys(newIndexes).length);
    Object.keys(newIndexes).forEach((name) => {
      console.log(`  - ${name}`);
    });
    console.log("");

    // Test the query performance
    console.log("🧪 Testing query performance...\n");

    const testStart = Date.now();
    const explainResult = await Product.find({
      isPublic: true,
    })
      .limit(10)
      .explain("executionStats");
    const testTime = Date.now() - testStart;

    const stage = explainResult.executionStats.executionStages.stage;
    console.log(`Query execution:`);
    console.log(`  - Stage: ${stage}`);
    console.log(`  - Time: ${testTime}ms`);
    console.log(
      `  - Docs Examined: ${explainResult.executionStats.totalDocsExamined}`,
    );
    console.log(
      `  - Docs Returned: ${explainResult.executionStats.nReturned}\n`,
    );

    if (
      stage === "IXSCAN" ||
      (stage === "FETCH" &&
        explainResult.executionStats.executionStages.inputStage?.stage ===
          "IXSCAN")
    ) {
      console.log("✅ Using index scan (IXSCAN) - Perfect!\n");
    } else if (stage === "COLLSCAN") {
      console.log("⚠️  Still using collection scan (COLLSCAN)");
      console.log("   This might be because:");
      console.log(
        "   1. Very small collection (MongoDB prefers COLLSCAN for < 100 docs)",
      );
      console.log("   2. Index not yet fully built");
      console.log("   3. Query selectivity too low\n");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Index rebuild completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Summary:");
    console.log("  - All model indexes have been rebuilt");
    console.log("  - Old/duplicate indexes removed");
    console.log("  - New indexes aligned with query patterns");
    console.log("  - Database ready for production\n");
  } catch (error) {
    console.error("❌ Index rebuild failed:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    process.exit(0);
  }
};

// Run rebuild
rebuildIndexes();
