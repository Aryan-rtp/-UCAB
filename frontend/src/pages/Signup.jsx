/**
 * Signup Page
 * Supports registration as rider or driver (with vehicle info).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [role, setRole] = useState('rider');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    vehicle: {
      make: '',
      model: '',
      year: 2024,
      color: '',
      plateNumber: '',
      vehicleType: 'sedan',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      };

      if (role === 'driver') {
        payload.licenseNumber = form.licenseNumber;
        payload.vehicle = form.vehicle;
      }

      const userData = await signup(payload);

      if (userData.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = (field, value) => {
    setForm({ ...form, vehicle: { ...form.vehicle, [field]: value } });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join UCAB today</p>
        </div>

        {/* Role Selector */}
        <div style={styles.roleSelector}>
          <button
            onClick={() => setRole('rider')}
            style={{ ...styles.roleBtn, ...(role === 'rider' ? styles.roleBtnActive : {}) }}
          >
            🧑 Rider
          </button>
          <button
            onClick={() => setRole('driver')}
            style={{ ...styles.roleBtn, ...(role === 'driver' ? styles.roleBtnActive : {}) }}
          >
            🚗 Driver
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
              style={styles.input}
            />
          </div>

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

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
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
                placeholder="Min 6 characters"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Driver-specific fields */}
          {role === 'driver' && (
            <>
              <hr style={styles.divider} />
              <h3 style={styles.sectionTitle}>Driver Information</h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>License Number</label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  placeholder="KA-01-2024-XXXXXXX"
                  required
                  style={styles.input}
                />
              </div>

              <h3 style={styles.sectionTitle}>Vehicle Details</h3>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Make</label>
                  <input
                    type="text"
                    value={form.vehicle.make}
                    onChange={(e) => updateVehicle('make', e.target.value)}
                    placeholder="Maruti"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Model</label>
                  <input
                    type="text"
                    value={form.vehicle.model}
                    onChange={(e) => updateVehicle('model', e.target.value)}
                    placeholder="Swift"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Color</label>
                  <input
                    type="text"
                    value={form.vehicle.color}
                    onChange={(e) => updateVehicle('color', e.target.value)}
                    placeholder="White"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Plate Number</label>
                  <input
                    type="text"
                    value={form.vehicle.plateNumber}
                    onChange={(e) => updateVehicle('plateNumber', e.target.value)}
                    placeholder="KA01AB1234"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Year</label>
                  <input
                    type="number"
                    value={form.vehicle.year}
                    onChange={(e) => updateVehicle('year', parseInt(e.target.value, 10))}
                    min="2000"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Vehicle Type</label>
                  <select
                    value={form.vehicle.vehicleType}
                    onChange={(e) => updateVehicle('vehicleType', e.target.value)}
                    style={styles.input}
                  >
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
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
    maxWidth: '520px',
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
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    width: '100%',
    boxSizing: 'border-box',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0.5rem 0',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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

export default Signup;
