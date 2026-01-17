const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    phone: { type: String },
    addresses: [
      {
        address: String,
        city: String,
        postalCode: String,
        country: String,
        state: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        price: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    walletBalance: { type: Number, default: 0 },
    walletTransactions: [
      {
        type: { type: String, enum: ["refund", "credit", "debit"] },
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ==================== INDEXES ====================
// Indexes for user queries

// NOTE: email index created automatically by unique: true - no duplicate needed

// 1. Reset password token lookups
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// 2. Admin users filter
userSchema.index({ isAdmin: 1 });

// 3. Text search for admin user search
userSchema.index({ name: "text", email: "text" });

module.exports = mongoose.model("User", userSchema);
