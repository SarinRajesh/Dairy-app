import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { setToken, setUser } from '../utils/auth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 1) {
          error = 'Password cannot be empty';
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error;
  };

  const validateForm = () => {
    const errors = {};
    const fields = ['email', 'password'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend validation errors
        if (data.errors) {
          // Set field-specific errors from backend
          setFieldErrors(data.errors);
          setError('Please fix the validation errors above');
          return;
        }
        throw new Error(data.message || 'Login failed');
      }
      
      // Enhanced auth storage with token expiration
      setToken(data.token);
      setUser(data.user);
      
      // Show success message and redirect
      setError(''); // Clear any previous errors
      alert(`✅ Welcome back, ${data.user.firstName}!`);
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Navbar />
      
      <div className="login-main">
        <div className="login-content">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your Dairy Farm customer account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className={touched.email && fieldErrors.email ? 'error' : (formData.email.trim() ? 'valid' : '')}
                />
                {touched.email && fieldErrors.email && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.email}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={touched.password && fieldErrors.password ? 'error' : (formData.password ? 'valid' : '')}
                />
                {touched.password && fieldErrors.password && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="api-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              className={`login-button ${isLoading ? 'loading' : ''}`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {!isLoading ? "Sign In" : "Signing In..."}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="social-button google">
              <span className="social-icon">🔍</span>
              Continue with Google
            </button>
            <button className="social-button facebook">
              <span className="social-icon">📘</span>
              Continue with Facebook
            </button>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <div className="dairy-icon">🐄</div>
            <h2>Welcome to Our Dairy Community</h2>
            <p>Join thousands of satisfied customers who trust us for their daily dairy needs. Experience farm-fresh quality delivered to your doorstep.</p>
            
            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Farm Partners</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Customer Support</span>
              </div>
            </div>

            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>100% Organic & Fresh Products</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🚚</span>
                <span>Same Day Delivery Available</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💎</span>
                <span>Premium Quality Guaranteed</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <span>Easy Mobile Ordering</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span>Exclusive Member Discounts</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔄</span>
                <span>Flexible Subscription Plans</span>
              </div>
            </div>

            <div className="trust-badges">
              <div className="badge">🏆 Certified Organic</div>
              <div className="badge">🔒 Secure Payment</div>
              <div className="badge">🌱 Eco-Friendly</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
