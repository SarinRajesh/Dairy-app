import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/auth';
import { API_BASE_URL } from '../config';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/orders/my-orders`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load orders' });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      setMessage({ type: 'success', text: 'Order cancelled successfully' });
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error cancelling order:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to cancel order' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'out_for_delivery': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    switch (timeString) {
      case 'morning': return '8 AM - 12 PM';
      case 'afternoon': return '12 PM - 4 PM';
      case 'evening': return '4 PM - 8 PM';
      default: return timeString;
    }
  };

  if (isLoading) {
    return (
      <div className="orders-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-container">
      <Navbar />
      
      <div className="orders-content">
        <div className="orders-header">
          <h1>My Orders</h1>
          <button 
            className="new-order-btn"
            onClick={() => navigate('/buy-milk')}
          >
            Order New Milk
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start by ordering some fresh milk!</p>
            <button 
              className="order-now-btn"
              onClick={() => navigate('/buy-milk')}
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                  </div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                  >
                    {getStatusText(order.orderStatus)}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-details">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-quantity">{item.quantity} litres</span>
                      </div>
                      <div className="item-price">₹{item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="total-amount">₹{order.orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Payment Method:</span>
                    <span className="payment-method">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Payment Status:</span>
                    <span className={`payment-status ${order.paymentStatus}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="delivery-info">
                  <h4>Delivery Details</h4>
                  <div className="delivery-address">
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                    <p>Phone: {order.deliveryAddress.phone}</p>
                  </div>
                  <div className="delivery-timing">
                    <p><strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}</p>
                    <p><strong>Delivery Time:</strong> {formatTime(order.deliveryTime)}</p>
                  </div>
                  {order.specialInstructions && (
                    <div className="special-instructions">
                      <p><strong>Special Instructions:</strong></p>
                      <p>{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                {order.orderStatus === 'pending' && (
                  <div className="order-actions">
                    <button 
                      className="cancel-order-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
