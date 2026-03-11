/**
 * Login Page
 * Supports login as rider, driver, or admin.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', loginAs: 'rider' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login({
        email: form.email,
        password: form.password,
        loginAs: form.loginAs === 'driver' ? 'driver' : undefined,
      });

      // Navigate based on role
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your UCAB account</p>
        </div>

        {/* Role Selector */}
        <div style={styles.roleSelector}>
          {['rider', 'driver', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setForm({ ...form, loginAs: role })}
              style={{
                ...styles.roleBtn,
                ...(form.loginAs === role ? styles.roleBtnActive : {}),
              }}
            >
              {role === 'rider' ? '🧑' : role === 'driver' ? '🚗' : '⚙️'}{' '}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '2rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.9rem',
    margin: 0,
  },
  roleSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  roleBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.2s',
  },
  roleBtnActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
    color: '#1a1a2e',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#f5c518',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '1.5rem',
  },
  link: {
    color: '#1a1a2e',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;
