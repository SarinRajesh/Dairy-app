import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";
import dairyImage from "../assets/dairy.jpg";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />

      <div
        className="hero"
        style={{ backgroundImage: `url(${dairyImage})` }}
      >
        <div className="overlay">
          <h2>Fresh Farm Milk Delivered Daily</h2>
          <p>Experience the pure taste of fresh, organic milk straight from our dairy farm. No preservatives, no additives - just pure, natural goodness delivered to your doorstep every morning.</p>
          <div className="hero-buttons">
            <Link to="/buy-milk" className="btn btn-primary">Order Fresh Milk</Link>
            <Link to="/orders" className="btn btn-secondary">Track Delivery</Link>
          </div>
        </div>
      </div>

      <section className="features">
        <h3>Why Our Milk Stands Out?</h3>
        <p className="subtitle">We're passionate about delivering the freshest, highest-quality milk while maintaining the highest standards of dairy farming.</p>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🥛</div>
            <h4>100% Pure Cow Milk</h4>
            <p>Our Holstein and Jersey cows produce rich, creamy milk with 3.25% fat content. No artificial hormones, no antibiotics - just pure natural milk.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌅</div>
            <h4>Morning Milking</h4>
            <p>We milk our cows at 5 AM daily, ensuring you receive milk that's less than 6 hours old. Fresh from udder to bottle to your table.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌾</div>
            <h4>Grass-Fed Cows</h4>
            <p>Our cows graze on organic pastures and are fed high-quality hay and grain. This natural diet produces milk rich in omega-3 fatty acids and vitamins.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">❄️</div>
            <h4>Cold Chain Delivery</h4>
            <p>Our milk is immediately chilled to 2°C after milking and maintained at this temperature throughout delivery to preserve freshness and taste.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Happy Families</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">45</div>
            <div className="stat-label">Dairy Cows</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5AM</div>
            <div className="stat-label">Daily Milking</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">6hrs</div>
            <div className="stat-label">Max Freshness</div>
          </div>
        </div>
      </section>

      <section className="milk-varieties">
        <h3>Our Milk Varieties</h3>
        <p className="subtitle">Choose from our range of fresh milk options, all produced with the same care and quality standards.</p>
        <div className="milk-grid">
          <div className="milk-card">
            <div className="milk-icon">🥛</div>
            <h4>Whole Milk</h4>
            <p className="milk-description">Rich and creamy 3.25% fat milk, perfect for drinking, cooking, and making yogurt.</p>
            <div className="milk-details">
              <span className="milk-fat">3.25% Fat</span>
              <span className="milk-size">1 Liter</span>
            </div>
          </div>
          <div className="milk-card">
            <div className="milk-icon">🥛</div>
            <h4>2% Reduced Fat</h4>
            <p className="milk-description">Smooth and nutritious milk with reduced fat content, great for health-conscious families.</p>
            <div className="milk-details">
              <span className="milk-fat">2% Fat</span>
              <span className="milk-size">1 Liter</span>
            </div>
          </div>
          <div className="milk-card">
            <div className="milk-icon">🥛</div>
            <h4>Skim Milk</h4>
            <p className="milk-description">Light and refreshing milk with minimal fat, packed with protein and calcium.</p>
            <div className="milk-details">
              <span className="milk-fat">0.1% Fat</span>
              <span className="milk-size">1 Liter</span>
            </div>
          </div>
        </div>
      </section>

      <section className="delivery-info">
        <div className="delivery-content">
          <h3>How Our Delivery Works</h3>
          <div className="delivery-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Morning Milking</h4>
              <p>Our cows are milked at 5 AM daily using modern, hygienic equipment.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Quality Testing</h4>
              <p>Each batch is tested for purity, fat content, and bacterial count.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Bottling & Chilling</h4>
              <p>Milk is bottled in glass containers and immediately chilled to 2°C.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Morning Delivery</h4>
              <p>Fresh milk delivered to your doorstep by 8 AM, guaranteed fresh.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h3>Start Your Day with Fresh Farm Milk</h3>
          <p>Join our community of milk lovers who trust us for their daily dairy needs. Experience the difference that truly fresh milk makes.</p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary">Start Ordering</a>
            <a href="/buy" className="btn btn-secondary">View Milk Options</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
