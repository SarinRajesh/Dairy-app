import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Simple auth check from localStorage
  const isAuthenticated = !!localStorage.getItem('token');
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo">Dairy Farm</div>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/buy-milk">Buy Milk</Link>
        <Link to="/orders">Orders</Link>
        
        {isAuthenticated ? (
          // User is logged in
          <div className="dropdown">
            <span className="user-menu">
              👤 {user?.firstName || 'User'} ▼
            </span>
            <div className="dropdown-menu">
              <div className="user-info">
                <p>Welcome, {user?.firstName} {user?.lastName}</p>
                <p className="user-email">{user?.email}</p>
              </div>
              <Link to="/profile">Profile</Link>
              <Link to="/orders">My Orders</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          // User is not logged in
          <div className="dropdown">
            <span>User ▼</span>
            <div className="dropdown-menu">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        )}
      </div>

      <div className="nav-cta">
        {isAuthenticated ? (
          <Link to="/buy-milk" className="btn btn-primary">Order Now</Link>
        ) : (
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        )}
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
};

export default Navbar;
