import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiRequest, isTokenValid } from "../utils/auth";
import { API_BASE_URL } from "../config";
import "./BuyMilk.css";

const BuyMilk = () => {
  const navigate = useNavigate();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    deliveryDate: '',
    deliveryTime: 'morning',
    paymentMethod: 'cod',
    specialInstructions: ''
  });

  // Single milk product data
  const milkProduct = {
    id: 1,
    name: "Fresh Organic Whole Milk",
    description: "Premium organic whole milk from grass-fed cows. Rich in nutrients, natural flavor, and perfect for daily consumption. Our milk is pasteurized and packaged fresh daily.",
    price: 70, // ₹70 per litre
    originalPrice: 80,
    image: "🥛",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    farm: "Green Valley Farm",
    delivery: "Same day delivery",
    organic: true,
    lactoseFree: false,
    fatContent: "3.25%",
    source: "Grass-fed cows",
    bestBefore: "7 days",
    storage: "Refrigerate at 2-4°C",
    nutrition: {
      calories: "150 kcal",
      protein: "8g",
      carbs: "12g",
      fat: "8g",
      calcium: "300mg"
    },
    features: [
      "100% Organic",
      "Grass-fed cows",
      "No artificial hormones",
      "Pasteurized",
      "Fresh daily"
    ]
  };

  // Available litre options
  const litreOptions = [
    { value: 0.5, label: "0.5 Litres", price: milkProduct.price * 0.5 },
    { value: 1, label: "1 Litre", price: milkProduct.price * 1 },
    { value: 1.5, label: "1.5 Litres", price: milkProduct.price * 1.5 },
    { value: 2, label: "2 Litres", price: milkProduct.price * 2 },
    { value: 3, label: "3 Litres", price: milkProduct.price * 3 },
    { value: 5, label: "5 Litres", price: milkProduct.price * 5 },
    { value: 10, label: "10 Litres", price: milkProduct.price * 10 }
  ];

  // Start purchase process
  const startPurchase = () => {
    // Check if user is authenticated
    if (!isTokenValid()) {
      setMessage({ type: 'error', text: 'Please login to place an order' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    setShowCheckout(true);
  };

  // Handle delivery form changes
  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Place order
  const placeOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const orderData = {
        items: [{
          productName: milkProduct.name,
          quantity: selectedQuantity,
          pricePerLiter: milkProduct.price,
          totalPrice: milkProduct.price * selectedQuantity
        }],
        deliveryAddress: {
          street: deliveryForm.street,
          city: deliveryForm.city,
          state: deliveryForm.state,
          pincode: deliveryForm.pincode,
          phone: deliveryForm.phone
        },
        deliveryDate: deliveryForm.deliveryDate,
        deliveryTime: deliveryForm.deliveryTime,
        paymentMethod: deliveryForm.paymentMethod,
        specialInstructions: deliveryForm.specialInstructions
      };

      const response = await apiRequest(`${API_BASE_URL}/api/orders/create`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      setMessage({ type: 'success', text: 'Order placed successfully! You will receive a confirmation shortly.' });
      setShowCheckout(false);
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      
      // Handle different types of errors
      if (error.message.includes('<!DOCTYPE')) {
        setMessage({ type: 'error', text: 'Server error. Please try again or contact support.' });
      } else if (error.message.includes('401')) {
        setMessage({ type: 'error', text: 'Please login to place an order' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to place order. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = (newQuantity) => {
    setSelectedQuantity(newQuantity);
  };

  // Calculate total price
  const totalPrice = milkProduct.price * selectedQuantity;
  const savings = milkProduct.originalPrice - milkProduct.price;

  return (
    <div className="buy-milk-container">
      <Navbar />
      
      {/* Hero Section */}
      <div className="buy-hero">
        <div className="buy-hero-content">
          <h1>Fresh Organic Whole Milk</h1>
          <p>Choose your quantity and enjoy farm-fresh milk delivered to your doorstep</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="buy-main">
        <div className="product-details">
          {/* Product Image and Basic Info */}
          <div className="product-hero">
            <div className="product-image-large">
              <span className="product-emoji-large">{milkProduct.image}</span>
              {milkProduct.originalPrice > milkProduct.price && (
                <div className="discount-badge-large">
                  {Math.round((savings / milkProduct.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            
            <div className="product-basic-info">
              <h2>{milkProduct.name}</h2>
              <p className="product-description">{milkProduct.description}</p>
              
              <div className="product-rating-large">
                <span className="stars-large">{'★'.repeat(Math.floor(milkProduct.rating))}</span>
                <span className="rating-text-large">{milkProduct.rating} ({milkProduct.reviews} reviews)</span>
              </div>
              
              <div className="product-features-list">
                {milkProduct.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="product-specifications">
            <h3>Product Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Fat Content:</span>
                <span className="spec-value">{milkProduct.fatContent}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Source:</span>
                <span className="spec-value">{milkProduct.source}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Best Before:</span>
                <span className="spec-value">{milkProduct.bestBefore}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Storage:</span>
                <span className="spec-value">{milkProduct.storage}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Farm:</span>
                <span className="spec-value">{milkProduct.farm}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Delivery:</span>
                <span className="spec-value">{milkProduct.delivery}</span>
              </div>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="nutrition-section">
            <h3>Nutrition Facts (per litre)</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-value">{milkProduct.nutrition.calories}</span>
                <span className="nutrition-label">Calories</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{milkProduct.nutrition.protein}</span>
                <span className="nutrition-label">Protein</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{milkProduct.nutrition.carbs}</span>
                <span className="nutrition-label">Carbohydrates</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{milkProduct.nutrition.fat}</span>
                <span className="nutrition-label">Fat</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value">{milkProduct.nutrition.calcium}</span>
                <span className="nutrition-label">Calcium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="purchase-section">
          <div className="purchase-card">
            <h3>Select Quantity & Purchase</h3>
            
            {/* Price Display */}
            <div className="price-display">
              <div className="current-price-large">₹{milkProduct.price}</div>
              <div className="price-details">
                <span className="price-per-litre">per litre</span>
                {milkProduct.originalPrice > milkProduct.price && (
                  <span className="original-price-large">₹{milkProduct.originalPrice}</span>
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <label>Select Quantity (Litres):</label>
              <div className="litre-options">
                {litreOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`litre-option ${selectedQuantity === option.value ? 'selected' : ''}`}
                    onClick={() => updateQuantity(option.value)}
                  >
                    <span className="litre-amount">{option.label}</span>
                    <span className="litre-price">₹{option.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Quantity Input */}
            <div className="custom-quantity">
              <label>Or enter custom quantity:</label>
              <div className="custom-quantity-input">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={selectedQuantity}
                  onChange={(e) => updateQuantity(parseFloat(e.target.value) || 0.5)}
                  className="quantity-input-custom"
                />
                <span className="quantity-unit">litres</span>
              </div>
            </div>

            {/* Total Price */}
            <div className="total-price-section">
              <div className="total-price">
                <span className="total-label">Total Price:</span>
                <span className="total-amount">₹{totalPrice.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="savings-info">
                  You save: ₹{savings.toFixed(2)}
                </div>
              )}
            </div>

            {/* Purchase Button */}
            <button
              className="purchase-btn-large"
              onClick={startPurchase}
              disabled={!milkProduct.inStock}
            >
              {!milkProduct.inStock ? 'Out of Stock' : 'Purchase Now'}
            </button>
            
            {/* Authentication Message */}
            {message.text && !showCheckout && (
              <div className={`auth-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-content">
            <div className="checkout-header">
              <h3>Complete Your Purchase</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowCheckout(false)}
              >
                ×
              </button>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={placeOrder} className="checkout-form">
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="summary-item">
                  <span>{milkProduct.name}</span>
                  <span>{selectedQuantity} litres × ₹{milkProduct.price}</span>
                </div>
                <div className="summary-total">
                  <strong>Total: ₹{totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <div className="delivery-details">
                <h4>Delivery Details</h4>
                
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={deliveryForm.street}
                    onChange={handleDeliveryChange}
                    required
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryForm.city}
                      onChange={handleDeliveryChange}
                      required
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryForm.state}
                      onChange={handleDeliveryChange}
                      required
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={deliveryForm.pincode}
                      onChange={handleDeliveryChange}
                      required
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryForm.phone}
                      onChange={handleDeliveryChange}
                      required
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={deliveryForm.deliveryDate}
                      onChange={handleDeliveryChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Delivery Time *</label>
                    <select
                      name="deliveryTime"
                      value={deliveryForm.deliveryTime}
                      onChange={handleDeliveryChange}
                      required
                    >
                      <option value="morning">Morning (8 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={deliveryForm.paymentMethod}
                    onChange={handleDeliveryChange}
                    required
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Special Instructions (Optional)</label>
                  <textarea
                    name="specialInstructions"
                    value={deliveryForm.specialInstructions}
                    onChange={handleDeliveryChange}
                    placeholder="Any special delivery instructions..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCheckout(false)}
                  disabled={isLoading}
                >
                  Back to Product
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BuyMilk;
