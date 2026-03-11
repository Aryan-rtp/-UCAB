/**
 * Home Page
 * Professional landing page for UCAB.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isDriver, isAdmin } = useAuth();

  const getCtaLink = () => {
    if (!isAuthenticated) return '/signup';
    if (isAdmin) return '/admin';
    if (isDriver) return '/driver';
    return '/book';
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Your Ride,<br />
            <span style={styles.heroHighlight}>Your Way</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Book affordable, reliable cab rides in seconds.
            Track your driver in real time and pay seamlessly.
          </p>
          <div style={styles.heroCta}>
            <Link to={getCtaLink()} style={styles.primaryBtn}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Link>
            {!isAuthenticated && (
              <Link to="/login" style={styles.secondaryBtn}>
                Login
              </Link>
            )}
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNumber}>10K+</span>
              <span style={styles.statLabel}>Riders</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>2K+</span>
              <span style={styles.statLabel}>Drivers</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>50K+</span>
              <span style={styles.statLabel}>Rides Completed</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>25+</span>
              <span style={styles.statLabel}>Cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>How UCAB Works</h2>
        <div style={styles.featureGrid}>
          {[
            {
              icon: '📍',
              title: 'Set Locations',
              desc: 'Enter your pickup and drop locations to get started.',
            },
            {
              icon: '🚕',
              title: 'Choose Your Ride',
              desc: 'Select from bikes, autos, sedans, and SUVs at transparent prices.',
            },
            {
              icon: '📡',
              title: 'Track in Real Time',
              desc: 'Watch your driver approach and track your ride live on the map.',
            },
            {
              icon: '💳',
              title: 'Pay Easily',
              desc: 'Pay with cash, card, UPI, or wallet — your choice.',
            },
          ].map((feature, idx) => (
            <div key={idx} style={styles.featureCard}>
              <span style={styles.featureIcon}>{feature.icon}</span>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle Types */}
      <section style={styles.vehicleSection}>
        <h2 style={styles.sectionTitle}>Ride Options</h2>
        <div style={styles.vehicleGrid}>
          {[
            { icon: '🏍️', name: 'Bike', price: 'From ₹20', time: 'Fastest' },
            { icon: '🛺', name: 'Auto', price: 'From ₹30', time: 'Quick' },
            { icon: '🚗', name: 'Hatchback', price: 'From ₹40', time: 'Comfortable' },
            { icon: '🚕', name: 'Sedan', price: 'From ₹50', time: 'Premium' },
            { icon: '🚙', name: 'SUV', price: 'From ₹80', time: 'Spacious' },
          ].map((v, idx) => (
            <div key={idx} style={styles.vehicleCard}>
              <span style={styles.vehicleIcon}>{v.icon}</span>
              <h4 style={styles.vehicleName}>{v.name}</h4>
              <p style={styles.vehiclePrice}>{v.price}</p>
              <span style={styles.vehicleTag}>{v.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Ride?</h2>
        <p style={styles.ctaDesc}>
          Join thousands of riders who trust UCAB for their daily commute.
        </p>
        <Link to={isAuthenticated ? '/book' : '/signup'} style={styles.ctaBtn}>
          {isAuthenticated ? 'Book a Ride Now' : 'Sign Up Free'}
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <span style={styles.footerLogo}>🚕 UCAB</span>
            <p style={styles.footerText}>Your reliable ride partner.</p>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>About</span>
            <span style={styles.footerLink}>Safety</span>
            <span style={styles.footerLink}>Help</span>
            <span style={styles.footerLink}>Careers</span>
          </div>
          <p style={styles.copyright}>© 2026 UCAB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '5rem 2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.1',
    marginBottom: '1.5rem',
  },
  heroHighlight: {
    color: '#f5c518',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#b0b0b0',
    lineHeight: '1.6',
    marginBottom: '2rem',
    maxWidth: '500px',
    margin: '0 auto 2rem',
  },
  heroCta: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '3rem',
  },
  primaryBtn: {
    background: '#f5c518',
    color: '#1a1a2e',
    padding: '14px 36px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1.05rem',
    transition: 'transform 0.2s',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#ffffff',
    padding: '14px 36px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.05rem',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#f5c518',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '4px',
  },
  features: {
    padding: '5rem 2rem',
    background: '#f8f9fa',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '2.5rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  featureCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
  },
  vehicleSection: {
    padding: '5rem 2rem',
    textAlign: 'center',
    background: '#ffffff',
  },
  vehicleGrid: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto',
  },
  vehicleCard: {
    padding: '1.5rem',
    borderRadius: '16px',
    border: '2px solid #f0f0f0',
    minWidth: '140px',
    textAlign: 'center',
  },
  vehicleIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  vehicleName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 0.25rem',
  },
  vehiclePrice: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0 0 0.5rem',
  },
  vehicleTag: {
    fontSize: '0.7rem',
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '3px 10px',
    borderRadius: '12px',
    fontWeight: '600',
  },
  ctaSection: {
    padding: '5rem 2rem',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '1rem',
  },
  ctaDesc: {
    fontSize: '1.05rem',
    color: '#b0b0b0',
    marginBottom: '2rem',
  },
  ctaBtn: {
    display: 'inline-block',
    background: '#f5c518',
    color: '#1a1a2e',
    padding: '16px 40px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  footer: {
    background: '#0d0d1a',
    padding: '3rem 2rem',
  },
  footerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerLogo: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#f5c518',
  },
  footerText: {
    color: '#666',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  footerLinks: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  footerLink: {
    color: '#888',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  copyright: {
    color: '#555',
    fontSize: '0.8rem',
  },
};

export default Home;
