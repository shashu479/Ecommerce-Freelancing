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

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: '₹' },
    image: { type: String }, // Main image (kept for backward compatibility, syncs with images[0])
    image2: { type: String }, // kept for backward compatibility
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v && v.length <= 5;
            },
            message: 'Maximum 5 images allowed.'
        }
    },
    category: { type: String, required: true },
    tag: { type: String },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    features: [String],
    ingredients: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
