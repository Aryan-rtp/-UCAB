/**
 * RideTracking Page
 * Real-time ride tracking with live map, status updates, and payment.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideAPI, paymentAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import MapTracker from '../components/MapTracker';

const RideTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const response = await rideAPI.getRide(id);
      setRide(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ride');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinRide', { rideId: id });

    socket.on('rideAccepted', (data) => setRide(data));
    socket.on('rideStarted', (data) => setRide(data));
    socket.on('rideCompleted', (data) => setRide(data));
    socket.on('rideCancelled', (data) => setRide(data));
    socket.on('driverLocationChanged', (data) => setDriverLocation(data.coordinates));
    socket.on('paymentProcessed', () => fetchRide());

    return () => {
      socket.off('rideAccepted');
      socket.off('rideStarted');
      socket.off('rideCompleted');
      socket.off('rideCancelled');
      socket.off('driverLocationChanged');
      socket.off('paymentProcessed');
    };
  }, [socket, id, fetchRide]);

  const handleCancel = async () => {
    try {
      await rideAPI.cancel(id, 'Cancelled by rider');
      fetchRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      await paymentAPI.process(id, paymentMethod);
      setPaymentModal(false);
      fetchRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!ride) return null;

  const driver = ride.driverId;
  const isActive = ['requested', 'accepted', 'started'].includes(ride.rideStatus);
  const isCompleted = ride.rideStatus === 'completed';
  const hasPaid = !!ride.paymentId;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Map Section */}
        <div style={styles.mapSection}>
          <MapTracker ride={ride} driverLocation={driverLocation} />
        </div>

        {/* Info Panel */}
        <div style={styles.infoPanel}>
          {/* Status Header */}
          <div style={{
            ...styles.statusHeader,
            backgroundColor:
              ride.rideStatus === 'completed' ? '#d1fae5' :
              ride.rideStatus === 'cancelled' ? '#fee2e2' :
              ride.rideStatus === 'started' ? '#dbeafe' : '#fef3c7',
          }}>
            <span style={styles.statusEmoji}>
              {ride.rideStatus === 'requested' ? '🔍' :
               ride.rideStatus === 'accepted' ? '🚕' :
               ride.rideStatus === 'started' ? '🏁' :
               ride.rideStatus === 'completed' ? '✅' : '❌'}
            </span>
            <div>
              <h2 style={styles.statusTitle}>
                {ride.rideStatus === 'requested' ? 'Searching for driver...' :
                 ride.rideStatus === 'accepted' ? 'Driver is on the way' :
                 ride.rideStatus === 'started' ? 'Ride in progress' :
                 ride.rideStatus === 'completed' ? 'Ride completed' : 'Ride cancelled'}
              </h2>
              <p style={styles.statusSub}>Ride #{ride._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Locations */}
          <div style={styles.section}>
            <div style={styles.locRow}>
              <span style={styles.greenDot}></span>
              <div>
                <span style={styles.locLabel}>PICKUP</span>
                <p style={styles.locText}>{ride.pickupLocation?.address}</p>
              </div>
            </div>
            <div style={styles.locLine}></div>
            <div style={styles.locRow}>
              <span style={styles.redDot}></span>
              <div>
                <span style={styles.locLabel}>DROP</span>
                <p style={styles.locText}>{ride.dropLocation?.address}</p>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>Distance</span>
              <span style={styles.detailValue}>{ride.distance} km</span>
            </div>
            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>Fare</span>
              <span style={styles.detailValue}>₹{ride.fare}</span>
            </div>
            <div style={styles.detailBox}>
              <span style={styles.detailLabel}>Vehicle</span>
              <span style={styles.detailValue}>{ride.vehicleType}</span>
            </div>
          </div>

          {/* Driver Info */}
          {driver && typeof driver === 'object' && (
            <div style={styles.driverCard}>
              <div style={styles.driverAvatar}>
                {driver.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div style={styles.driverDetails}>
                <p style={styles.driverName}>{driver.name}</p>
                <p style={styles.driverPhone}>{driver.phone}</p>
                {driver.vehicle && (
                  <p style={styles.vehicleText}>
                    {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model} | {driver.vehicle.plateNumber}
                  </p>
                )}
              </div>
              {driver.rating && (
                <span style={styles.driverRating}>★ {driver.rating.toFixed(1)}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            {isActive && ride.rideStatus !== 'started' && (
              <button onClick={handleCancel} style={styles.cancelBtn}>
                Cancel Ride
              </button>
            )}
            {isCompleted && !hasPaid && (
              <button onClick={() => setPaymentModal(true)} style={styles.payBtn}>
                Pay ₹{ride.fare}
              </button>
            )}
            {isCompleted && hasPaid && (
              <div style={styles.paidBadge}>Payment Complete ✓</div>
            )}
            <button onClick={() => navigate('/dashboard')} style={styles.dashBtn}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Complete Payment</h3>
            <p style={styles.modalAmount}>₹{ride.fare}</p>

            <div style={styles.paymentOptions}>
              {['cash', 'card', 'upi', 'wallet'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    ...styles.payOption,
                    ...(paymentMethod === method ? styles.payOptionActive : {}),
                  }}
                >
                  {method === 'cash' ? '💵' : method === 'card' ? '💳' :
                   method === 'upi' ? '📱' : '👝'}{' '}
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              style={styles.confirmPayBtn}
            >
              {paymentProcessing ? 'Processing...' : `Pay ₹${ride.fare}`}
            </button>
            <button
              onClick={() => setPaymentModal(false)}
              style={styles.closeModalBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#f5f7fa',
    padding: '2rem',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #f5c518',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorText: { color: '#dc2626', fontSize: '1.1rem' },
  backBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '2px solid #1a1a2e',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
  },
  mapSection: { width: '100%' },
  infoPanel: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '1.25rem',
  },
  statusEmoji: { fontSize: '1.8rem' },
  statusTitle: { fontSize: '1rem', fontWeight: '700', color: '#333', margin: 0 },
  statusSub: { fontSize: '0.75rem', color: '#888', margin: 0 },
  section: { padding: '1rem 1.25rem' },
  locRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  greenDot: {
    display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
    backgroundColor: '#2ecc71', marginTop: '4px', flexShrink: 0,
  },
  redDot: {
    display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
    backgroundColor: '#e74c3c', marginTop: '4px', flexShrink: 0,
  },
  locLine: { width: '2px', height: '14px', backgroundColor: '#ddd', marginLeft: '4px' },
  locLabel: { fontSize: '0.6rem', color: '#999', fontWeight: '700', letterSpacing: '1px' },
  locText: { margin: '2px 0 0', fontSize: '0.85rem', color: '#333' },
  detailsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0',
    borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0',
  },
  detailBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0.75rem', gap: '2px', borderRight: '1px solid #f0f0f0',
  },
  detailLabel: { fontSize: '0.65rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: '0.95rem', fontWeight: '700', color: '#333', textTransform: 'capitalize' },
  driverCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0',
  },
  driverAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#f5c518', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '1.2rem', flexShrink: 0,
  },
  driverDetails: { flex: 1 },
  driverName: { margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#333' },
  driverPhone: { margin: 0, fontSize: '0.8rem', color: '#777' },
  vehicleText: { margin: 0, fontSize: '0.75rem', color: '#999', textTransform: 'capitalize' },
  driverRating: { color: '#f39c12', fontWeight: '700', fontSize: '0.95rem' },
  actions: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem',
  },
  cancelBtn: {
    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
    background: '#fee2e2', color: '#dc2626', fontWeight: '600', cursor: 'pointer',
  },
  payBtn: {
    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
    background: '#f5c518', color: '#1a1a2e', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
  },
  paidBadge: {
    textAlign: 'center', padding: '12px', background: '#d1fae5',
    color: '#059669', borderRadius: '8px', fontWeight: '600',
  },
  dashBtn: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '2px solid #e5e7eb', background: '#fff', color: '#666',
    fontWeight: '600', cursor: 'pointer',
  },
  // Payment modal
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 2000,
  },
  modal: {
    background: '#fff', borderRadius: '16px', padding: '2rem',
    width: '90%', maxWidth: '400px', textAlign: 'center',
  },
  modalTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.5rem' },
  modalAmount: { fontSize: '2rem', fontWeight: '800', color: '#f5c518', margin: '0 0 1.5rem' },
  paymentOptions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' },
  payOption: {
    padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb',
    background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem',
  },
  payOptionActive: { borderColor: '#f5c518', background: '#fffbeb' },
  confirmPayBtn: {
    width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
    background: '#f5c518', color: '#1a1a2e', fontWeight: '700', fontSize: '1rem',
    cursor: 'pointer', marginBottom: '0.5rem',
  },
  closeModalBtn: {
    width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
    background: 'transparent', color: '#888', cursor: 'pointer',
  },
};

export default RideTracking;
