/**
 * RideCard Component
 * Displays a single ride's summary information.
 * Used in ride history lists and dashboards.
 */

const statusColors = {
  requested: '#3498db',
  accepted: '#f39c12',
  started: '#2ecc71',
  completed: '#27ae60',
  cancelled: '#e74c3c',
};

const RideCard = ({ ride, showActions, onAction }) => {
  const status = ride.rideStatus || 'requested';
  const driver = ride.driverId;
  const payment = ride.paymentId;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.card}>
      {/* Status Badge */}
      <div style={styles.header}>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: statusColors[status] || '#999',
        }}>
          {status.toUpperCase()}
        </span>
        <span style={styles.date}>{formatDate(ride.createdAt)}</span>
      </div>

      {/* Locations */}
      <div style={styles.locations}>
        <div style={styles.locationRow}>
          <span style={styles.dot("#2ecc71")}></span>
          <div>
            <span style={styles.locLabel}>PICKUP</span>
            <p style={styles.locText}>{ride.pickupLocation?.address || '—'}</p>
          </div>
        </div>
        <div style={styles.locationLine}></div>
        <div style={styles.locationRow}>
          <span style={styles.dot("#e74c3c")}></span>
          <div>
            <span style={styles.locLabel}>DROP</span>
            <p style={styles.locText}>{ride.dropLocation?.address || '—'}</p>
          </div>
        </div>
      </div>

      {/* Ride Details */}
      <div style={styles.details}>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Distance</span>
          <span style={styles.detailValue}>{ride.distance} km</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Fare</span>
          <span style={styles.detailValue}>₹{ride.fare}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Vehicle</span>
          <span style={styles.detailValue}>{ride.vehicleType || 'Sedan'}</span>
        </div>
      </div>

      {/* Driver Info */}
      {driver && typeof driver === 'object' && (
        <div style={styles.driverInfo}>
          <div style={styles.driverAvatar}>
            {driver.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <p style={styles.driverName}>{driver.name}</p>
            <p style={styles.driverPhone}>{driver.phone}</p>
            {driver.vehicle && (
              <p style={styles.vehicleInfo}>
                {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model} • {driver.vehicle.plateNumber}
              </p>
            )}
          </div>
          {driver.rating && (
            <span style={styles.rating}>★ {driver.rating.toFixed(1)}</span>
          )}
        </div>
      )}

      {/* Payment Info */}
      {payment && typeof payment === 'object' && (
        <div style={styles.paymentInfo}>
          <span>Payment: {payment.paymentMethod?.toUpperCase()}</span>
          <span style={{
            color: payment.paymentStatus === 'completed' ? '#27ae60' : '#e74c3c',
            fontWeight: '600',
          }}>
            {payment.paymentStatus?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div style={styles.actions}>
          {status === 'requested' && onAction?.onCancel && (
            <button
              onClick={() => onAction.onCancel(ride._id)}
              style={{ ...styles.actionBtn, ...styles.cancelBtn }}
            >
              Cancel Ride
            </button>
          )}
          {status === 'accepted' && onAction?.onStart && (
            <button
              onClick={() => onAction.onStart(ride._id)}
              style={{ ...styles.actionBtn, ...styles.startBtn }}
            >
              Start Ride
            </button>
          )}
          {status === 'started' && onAction?.onComplete && (
            <button
              onClick={() => onAction.onComplete(ride._id)}
              style={{ ...styles.actionBtn, ...styles.completeBtn }}
            >
              Complete Ride
            </button>
          )}
          {status === 'completed' && !payment && onAction?.onPay && (
            <button
              onClick={() => onAction.onPay(ride._id)}
              style={{ ...styles.actionBtn, ...styles.payBtn }}
            >
              Pay ₹{ride.fare}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  statusBadge: {
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  date: {
    color: '#888',
    fontSize: '0.8rem',
  },
  locations: {
    marginBottom: '1rem',
    paddingLeft: '4px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  dot: (color) => ({
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: color,
    marginTop: '5px',
    flexShrink: 0,
  }),
  locationLine: {
    width: '2px',
    height: '16px',
    backgroundColor: '#ddd',
    marginLeft: '4px',
  },
  locLabel: {
    fontSize: '0.65rem',
    color: '#999',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  locText: {
    margin: '2px 0 0',
    fontSize: '0.9rem',
    color: '#333',
  },
  details: {
    display: 'flex',
    gap: '1.5rem',
    padding: '0.75rem 0',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '0.75rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailLabel: {
    fontSize: '0.7rem',
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  driverInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  driverAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#f5c518',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  driverName: {
    margin: 0,
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#333',
  },
  driverPhone: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#777',
  },
  vehicleInfo: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#999',
    textTransform: 'capitalize',
  },
  rating: {
    marginLeft: 'auto',
    color: '#f39c12',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  paymentInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#666',
    padding: '0.5rem 0',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
  },
  actionBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'opacity 0.2s',
  },
  cancelBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  startBtn: {
    backgroundColor: '#d1fae5',
    color: '#059669',
  },
  completeBtn: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
  },
  payBtn: {
    backgroundColor: '#f5c518',
    color: '#1a1a2e',
  },
};

export default RideCard;
