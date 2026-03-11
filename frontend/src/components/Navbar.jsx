/**
 * Navbar Component
 * Responsive navigation bar with role-based menu items.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDriver } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isDriver) return '/driver';
    return '/dashboard';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🚕</span>
          <span style={styles.logoText}>UCAB</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          style={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span style={styles.menuBar}></span>
          <span style={styles.menuBar}></span>
          <span style={styles.menuBar}></span>
        </button>

        {/* Nav Links */}
        <div style={{
          ...styles.navLinks,
          ...(isMenuOpen ? styles.navLinksOpen : {}),
        }}>
          {isAuthenticated ? (
            <>
              {!isDriver && !isAdmin && (
                <Link to="/book" style={styles.link} onClick={() => setIsMenuOpen(false)}>
                  Book Ride
                </Link>
              )}
              <Link to={getDashboardLink()} style={styles.link} onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <div style={styles.userSection}>
                <span style={styles.userName}>{user?.name}</span>
                <span style={styles.userRole}>{user?.role}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link} onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" style={styles.signupBtn} onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '0 1rem',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    flexWrap: 'wrap',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#f5c518',
    letterSpacing: '2px',
  },
  menuToggle: {
    display: 'none',
    flexDirection: 'column',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  menuBar: {
    display: 'block',
    width: '24px',
    height: '2px',
    backgroundColor: '#fff',
    borderRadius: '2px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLinksOpen: {},
  link: {
    color: '#e0e0e0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  userRole: {
    color: '#f5c518',
    fontSize: '0.75rem',
    background: 'rgba(245,197,24,0.15)',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  signupBtn: {
    background: '#f5c518',
    color: '#1a1a2e',
    padding: '8px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
};

export default Navbar;
