/**
 * Quick Fix: Update all products with isPublic field
 * Run this to fix the 500 error
 */

const mongoose = require("mongoose");
require("dotenv").config();

const quickFix = async () => {
  try {
    console.log("🔧 Quick fix: Adding isPublic field to all products...\n");

    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/siraba_organic",
    );
    console.log(`✓ Connected to MongoDB\n`);

    const Product = require("./models/Product");

    // Update admin products (non-vendor) - always public
    const adminResult = await Product.updateMany(
      {
        $or: [
          { isVendorProduct: { $ne: true } },
          { isVendorProduct: { $exists: false } },
        ],
      },
      { $set: { isPublic: true } },
    );
    console.log(
      `✅ Updated ${adminResult.modifiedCount} admin products to isPublic: true`,
    );

    // Update approved & active vendor products - public
    const approvedResult = await Product.updateMany(
      {
        isVendorProduct: true,
        vendorStatus: "approved",
        isActive: true,
      },
      { $set: { isPublic: true } },
    );
    console.log(
      `✅ Updated ${approvedResult.modifiedCount} approved vendor products to isPublic: true`,
    );

    // Update non-approved or inactive vendor products - not public
    const notApprovedResult = await Product.updateMany(
      {
        isVendorProduct: true,
        $or: [
          { vendorStatus: { $ne: "approved" } },
          { isActive: { $ne: true } },
        ],
      },
      { $set: { isPublic: false } },
    );
    console.log(
      `✅ Updated ${notApprovedResult.modifiedCount} non-approved vendor products to isPublic: false`,
    );

    // Verify
    const totalProducts = await Product.countDocuments({});
    const publicProducts = await Product.countDocuments({ isPublic: true });
    const privateProducts = await Product.countDocuments({ isPublic: false });
    const missingField = await Product.countDocuments({
      isPublic: { $exists: false },
    });

    console.log("\n📊 Migration Summary:");
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Public products: ${publicProducts}`);
    console.log(`   Private products: ${privateProducts}`);
    console.log(`   Missing isPublic field: ${missingField}`);

    if (missingField > 0) {
      console.warn(
        `\n⚠️  Warning: ${missingField} products still missing isPublic field!`,
      );
    } else {
      console.log(
        "\n✅ Migration complete - all products have isPublic field!",
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    process.exit(0);
  }
};

quickFix();
