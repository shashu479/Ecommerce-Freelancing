const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = reviewSchema; // Export schema to be embedded in Product, or model if standalone? 
// Usually embedded in Product for faster read, OR standalone.
// Let's check Product.js to see if it has reviews array.
