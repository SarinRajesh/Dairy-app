const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productName: {
            type: String,
            default: 'Fresh Organic Whole Milk',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0.5 // Minimum 0.5 litres
        },
        pricePerLiter: {
            type: Number,
            required: true,
            default: 70 // ₹70 per litre
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    orderTotal: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true }
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    deliveryTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        default: 'morning'
    },
    specialInstructions: {
        type: String,
        maxlength: 200
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.orderTotal = this.items.reduce((total, item) => {
            const itemTotal = item.totalPrice || 0;
            return total + itemTotal;
        }, 0);
    } else {
        this.orderTotal = 0;
    }
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Order', orderSchema);
