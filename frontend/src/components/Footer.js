import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-section">
            <div className="footer-logo">🐄 Premium Dairy Farm</div>
            <p>Delivering farm-fresh, organic dairy products to your doorstep. Quality, freshness, and sustainability in every product.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="/">Home</a>
              <a href="/buy">Products</a>
              <a href="/orders">Orders</a>
              <a href="/about">About Us</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <div className="footer-links">
              <a href="/delivery">Delivery</a>
              <a href="/subscription">Subscriptions</a>
              <a href="/wholesale">Wholesale</a>
              <a href="/farms">Our Farms</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p>📧 info@premiumdairy.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Farm Road, Dairy Valley, CA 90210</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2025 Premium Dairy Farm. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
