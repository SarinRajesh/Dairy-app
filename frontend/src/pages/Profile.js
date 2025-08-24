import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getToken, getUser, setUser, clearToken, isTokenValid, apiRequest } from '../utils/auth';
import dairyImage from '../assets/dairy.jpg';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  
  // Enhanced token and user data handling
  const [user, setUserState] = useState(getUser() || {});
  const [token, setTokenState] = useState(getToken());
  const [tokenValid, setTokenValid] = useState(true);

  // All useState calls must be at the top level
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [editForm, setEditForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || ''
  });

  // Check token validity on component mount
  useEffect(() => {
    const checkTokenValidity = () => {
      if (!isTokenValid()) {
        clearToken();
        setTokenValid(false);
        setTokenState(null);
        setUserState({});
        return false;
      }
      
      setTokenValid(true);
      setTokenState(getToken());
      return true;
    };

    checkTokenValidity();
  }, []);

  // Check if user is authenticated
  if (!tokenValid || !token || !user.id) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-main">
          <div className="profile-content">
            <div className="message error">
              <span className="message-icon">⚠️</span>
              Please login to view your profile.
            </div>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error message
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        } else if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return 'First name can only contain letters and spaces';
        }
        break;
      
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        } else if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return 'Last name can only contain letters and spaces';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          return 'Phone number is required';
        } else {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          if (cleanPhone.length < 10) {
            return 'Phone number must be at least 10 digits';
          } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(cleanPhone)) {
            return 'Please enter a valid phone number (minimum 10 digits)';
          }
        }
        break;
      
      default:
        return '';
    }
    return '';
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    Object.keys(editForm).forEach(field => {
      const error = validateField(field, editForm[field]);
      if (error) {
        errors[field] = error;
      }
    });
    return errors;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Mark all fields as touched so errors show up immediately
      const touchedFields = {};
      Object.keys(editForm).forEach(field => {
        touchedFields[field] = true;
      });
      setTouched(touchedFields);
      setFieldErrors(errors);
      setMessage({ type: 'error', text: 'Please fix the validation errors below' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await apiRequest('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend validation errors
        if (data.errors) {
          // Set field-specific errors from backend
          setFieldErrors(data.errors);
          setMessage({ 
            type: 'error', 
            text: 'Please fix the validation errors above'
          });
          return;
        }
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update localStorage with new user data
      setUser(data.user);
      setUserState(data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    });
    setMessage({ type: '', text: '' });
    setFieldErrors({});
    setTouched({});
  };

  // Handle logout
  const handleLogout = () => {
    clearToken();
    setTokenState(null);
    setUserState({});
    setTokenValid(false);
    navigate('/');
  };

  // Helper function to get input class names
  const getInputClassName = (fieldName) => {
    const baseClass = 'edit-input';
    if (fieldErrors[fieldName]) {
      return `${baseClass} error`;
    } else if (touched[fieldName] && !fieldErrors[fieldName] && editForm[fieldName]) {
      return `${baseClass} valid`;
    }
    return baseClass;
  };

  return (
    <div className="profile-container">
      <Navbar />
      
      <div className="profile-main">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-cover" style={{ backgroundImage: `url(${dairyImage})` }}>
              <div className="cover-overlay"></div>
              <div className="cover-content">
                <h2 className="cover-title">Dairy Farm Management</h2>
                <p className="cover-subtitle">Fresh & Organic Products</p>
              </div>
              <div className="profile-avatar">
                <span className="avatar-text">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
              </div>
            </div>
            <div className="profile-info">
              <h1>{user.firstName} {user.lastName}</h1>
              <p className="user-email">{user.email}</p>
              <div className="profile-meta">
                <span className="member-since">Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">
                {message.type === 'success' ? '✅' : '⚠️'}
              </span>
              {message.text}
            </div>
          )}

          {/* Profile Information */}
          <div className="profile-details">
            <div className="details-section">
              <div className="section-header">
                <h2>Personal Information</h2>
              </div>

              {!isEditing ? (
                // Display Mode
                <div className="info-grid">
                  <div className="info-item">
                    <label>First Name</label>
                    <span>{user.firstName}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Name</label>
                    <span>{user.lastName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email Address</label>
                    <span className="email-display">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone Number</label>
                    <span>{user.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Account Role</label>
                    <span className="role-badge">{user.role}</span>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleProfileUpdate} className="edit-form">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                        onBlur={handleBlur}
                        placeholder="Enter first name"
                        className={getInputClassName('firstName')}
                        required
                      />
                      {fieldErrors.firstName && (
                        <div className="field-error">
                          <span className="error-icon">⚠️</span>
                          {fieldErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditChange}
                        onBlur={handleBlur}
                        placeholder="Enter last name"
                        className={getInputClassName('lastName')}
                        required
                      />
                      {fieldErrors.lastName && (
                        <div className="field-error">
                          <span className="error-icon">⚠️</span>
                          {fieldErrors.lastName}
                        </div>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        onBlur={handleBlur}
                        placeholder="Enter email address"
                        className={getInputClassName('email')}
                        required
                      />
                      {fieldErrors.email && (
                        <div className="field-error">
                          <span className="error-icon">⚠️</span>
                          {fieldErrors.email}
                        </div>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        onBlur={handleBlur}
                        placeholder="Enter phone number"
                        className={getInputClassName('phone')}
                        required
                      />
                      {fieldErrors.phone && (
                        <div className="field-error">
                          <span className="error-icon">⚠️</span>
                          {fieldErrors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account Actions */}
            <div className="account-actions">
              <h2>Account</h2>
              <div className="action-buttons">
                <button className="btn btn-outline">
                  Change Password
                </button>
                <button className="btn btn-outline">
                  Email Preferences
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
