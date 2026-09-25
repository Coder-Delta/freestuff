const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    description: {type: String, default: ''},
    price: {type: Number, required: true, min: 0},
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Books', 'Food', 'Other'],
        default: 'Other',
    },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;