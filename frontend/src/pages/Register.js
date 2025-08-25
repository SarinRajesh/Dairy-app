import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Register.css';
import { API_BASE_URL } from '../config';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 2) {
          error = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = 'First name can only contain letters and spaces';
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (value.trim().length < 2) {
          error = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = 'Last name can only contain letters and spaces';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          if (cleanPhone.length < 10) {
            error = 'Phone number must be at least 10 digits';
          } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(cleanPhone)) {
            error = 'Please enter a valid phone number (minimum 10 digits)';
          }
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          error = 'Password must contain at least one special character (@$!%*?&)';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
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
    const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to get input className
  const getInputClassName = (fieldName) => {
    if (!touched[fieldName]) return '';
    if (fieldErrors[fieldName]) return 'error';
    if (formData[fieldName] && formData[fieldName].trim()) return 'valid';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
        throw new Error(data.message || 'Registration failed');
      }
      
      // Show success message and redirect
      setError(''); // Clear any previous errors
      alert(`✅ Registration successful! Welcome ${data.user.firstName}! Please login with your new account.`);
      navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Navbar />
      
      <div className="register-main">
        <div className="register-content">
          <div className="register-header">
            <div className="register-icon">🌟</div>
            <h1>Join Our Dairy Farm</h1>
            <p>Create your customer account and start enjoying fresh dairy products</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                    className={getInputClassName('firstName')}
                  />
                  {touched.firstName && fieldErrors.firstName && (
                    <div className="field-error">
                      <span className="error-icon">⚠️</span>
                      {fieldErrors.firstName}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                    className={getInputClassName('lastName')}
                  />
                  {touched.lastName && fieldErrors.lastName && (
                    <div className="field-error">
                      <span className="error-icon">⚠️</span>
                      {fieldErrors.lastName}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                  className={getInputClassName('email')}
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
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className={getInputClassName('phone')}
                />
                {touched.phone && fieldErrors.phone && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
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
                    placeholder="Create a password"
                    disabled={isLoading}
                    className={getInputClassName('password')}
                  />
                  {touched.password && fieldErrors.password && (
                    <div className="field-error">
                      <span className="error-icon">⚠️</span>
                      {fieldErrors.password}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className={getInputClassName('confirmPassword')}
                  />
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
                    <div className="field-error">
                      <span className="error-icon">⚠️</span>
                      {fieldErrors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="api-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`register-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Customer Account'}
            </button>
          </form>

          <div className="register-divider">
            <span>or</span>
          </div>

          <div className="social-register">
            <button className="social-button google">
              <span className="social-icon">🔍</span>
              Sign up with Google
            </button>
            <button className="social-button facebook">
              <span className="social-icon">📘</span>
              Sign up with Facebook
            </button>
          </div>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="signin-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="register-illustration">
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

export default Register;
