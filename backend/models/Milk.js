const mongoose = require('mongoose');

const milkSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true }, // in liters
    pricePerLiter: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Milk', milkSchema);
