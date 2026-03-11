/**
 * BookingForm Component
 * Location input form with vehicle selection and fare estimation.
 */

import { useState } from 'react';
import { rideAPI } from '../services/api';

const vehicleOptions = [
  { type: 'bike', label: 'Bike', icon: '🏍️', capacity: '1 person' },
  { type: 'auto', label: 'Auto', icon: '🛺', capacity: '3 persons' },
  { type: 'hatchback', label: 'Hatchback', icon: '🚗', capacity: '4 persons' },
  { type: 'sedan', label: 'Sedan', icon: '🚕', capacity: '4 persons' },
  { type: 'suv', label: 'SUV', icon: '🚙', capacity: '6 persons' },
];

const BookingForm = ({ onBookingComplete }) => {
  const [form, setForm] = useState({
    pickupAddress: '',
    dropAddress: '',
    vehicleType: 'sedan',
  });
  const [estimates, setEstimates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate mock coordinates from address string for demo purposes
  // In production, this would use a geocoding API (Google Maps, Mapbox, etc.)
  const generateCoordinates = (address) => {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = ((hash << 5) - hash) + address.charCodeAt(i);
      hash |= 0;
    }
    const lng = 77.5 + (Math.abs(hash % 100)) / 1000;
    const lat = 12.9 + (Math.abs((hash >> 8) % 100)) / 1000;
    return [lng, lat];
  };

  const handleEstimate = async () => {
    if (!form.pickupAddress || !form.dropAddress) {
      setError('Please enter both pickup and drop locations');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const pickupCoords = generateCoordinates(form.pickupAddress);
      const dropCoords = generateCoordinates(form.dropAddress);
      const response = await rideAPI.getEstimate(pickupCoords, dropCoords);
      setEstimates(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get fare estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setError('');
    setLoading(true);
    try {
      const pickupCoords = generateCoordinates(form.pickupAddress);
      const dropCoords = generateCoordinates(form.dropAddress);

      const response = await rideAPI.book({
        pickupAddress: form.pickupAddress,
        pickupCoordinates: pickupCoords,
        dropAddress: form.dropAddress,
        dropCoordinates: dropCoords,
        vehicleType: form.vehicleType,
      });

      if (onBookingComplete) {
        onBookingComplete(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Book Your Ride</h2>

      {error && <div style={styles.error}>{error}</div>}

      {/* Location Inputs */}
      <div style={styles.inputGroup}>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>📍</span>
          <input
            type="text"
            placeholder="Enter pickup location"
            value={form.pickupAddress}
            onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>📌</span>
          <input
            type="text"
            placeholder="Enter drop location"
            value={form.dropAddress}
            onChange={(e) => setForm({ ...form, dropAddress: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>

      {/* Vehicle Selection */}
      <div style={styles.vehicleSection}>
        <h3 style={styles.sectionTitle}>Select Vehicle</h3>
        <div style={styles.vehicleGrid}>
          {vehicleOptions.map((v) => (
            <button
              key={v.type}
              onClick={() => setForm({ ...form, vehicleType: v.type })}
              style={{
                ...styles.vehicleCard,
                ...(form.vehicleType === v.type ? styles.vehicleCardActive : {}),
              }}
            >
              <span style={styles.vehicleIcon}>{v.icon}</span>
              <span style={styles.vehicleLabel}>{v.label}</span>
              <span style={styles.vehicleCapacity}>{v.capacity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estimate Button */}
      <button onClick={handleEstimate} disabled={loading} style={styles.estimateBtn}>
        {loading ? 'Calculating...' : 'Get Fare Estimate'}
      </button>

      {/* Fare Estimates */}
      {estimates && (
        <div style={styles.estimatesSection}>
          <h3 style={styles.sectionTitle}>
            Fare Estimate — {estimates.distance} km
          </h3>
          <div style={styles.estimatesList}>
            {estimates.estimates.map((est) => (
              <div
                key={est.vehicleType}
                onClick={() => setForm({ ...form, vehicleType: est.vehicleType })}
                style={{
                  ...styles.estimateRow,
                  ...(form.vehicleType === est.vehicleType ? styles.estimateRowActive : {}),
                }}
              >
                <span style={styles.estVehicle}>
                  {vehicleOptions.find((v) => v.type === est.vehicleType)?.icon}{' '}
                  {est.vehicleType}
                </span>
                <span style={styles.estFare}>₹{est.totalFare}</span>
              </div>
            ))}
          </div>

          <button onClick={handleBook} disabled={loading} style={styles.bookBtn}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  title: {
    margin: '0 0 1.5rem',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0 12px',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    fontSize: '1.1rem',
    marginRight: '8px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '14px 0',
    fontSize: '0.95rem',
    color: '#333',
    background: 'transparent',
  },
  vehicleSection: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#666',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: '0.5rem',
  },
  vehicleCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  vehicleCardActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
  },
  vehicleIcon: {
    fontSize: '1.5rem',
  },
  vehicleLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#333',
  },
  vehicleCapacity: {
    fontSize: '0.65rem',
    color: '#999',
  },
  estimateBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#f5c518',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  estimatesSection: {
    marginTop: '1.5rem',
    padding: '1.25rem',
    background: '#f8f9fa',
    borderRadius: '12px',
  },
  estimatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  estimateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid transparent',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'capitalize',
  },
  estimateRowActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
  },
  estVehicle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#333',
  },
  estFare: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  bookBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#f5c518',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};

export default BookingForm;
