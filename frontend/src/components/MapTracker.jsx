/**
 * MapTracker Component
 * Simulated live map tracker for ride tracking.
 * In production, this would use Leaflet, Google Maps, or Mapbox GL.
 * This implementation provides a visual representation without external map dependencies.
 */

import { useState, useEffect } from 'react';

const MapTracker = ({ ride, driverLocation }) => {
  const [progress, setProgress] = useState(0);

  // Simulate driver movement progress
  useEffect(() => {
    if (ride?.rideStatus === 'started') {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
      }, 1000);
      return () => clearInterval(interval);
    }
    if (ride?.rideStatus === 'accepted') {
      setProgress(0);
    }
    if (ride?.rideStatus === 'completed') {
      setProgress(100);
    }
  }, [ride?.rideStatus]);

  if (!ride) return null;

  return (
    <div style={styles.container}>
      {/* Map Placeholder with Visual Representation */}
      <div style={styles.mapArea}>
        <div style={styles.mapOverlay}>
          {/* Route Visualization */}
          <div style={styles.route}>
            {/* Pickup Point */}
            <div style={styles.point}>
              <div style={{ ...styles.pointDot, backgroundColor: '#2ecc71' }}></div>
              <span style={styles.pointLabel}>
                {ride.pickupLocation?.address || 'Pickup'}
              </span>
            </div>

            {/* Progress Line */}
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              ></div>
              {/* Driver Icon on the progress line */}
              {ride.rideStatus === 'started' && (
                <div
                  style={{
                    ...styles.driverIcon,
                    left: `${Math.min(progress, 95)}%`,
                  }}
                >
                  🚕
                </div>
              )}
              {ride.rideStatus === 'accepted' && (
                <div style={{ ...styles.driverIcon, left: '0%' }}>
                  🚕
                </div>
              )}
            </div>

            {/* Drop Point */}
            <div style={styles.point}>
              <div style={{ ...styles.pointDot, backgroundColor: '#e74c3c' }}></div>
              <span style={styles.pointLabel}>
                {ride.dropLocation?.address || 'Drop'}
              </span>
            </div>
          </div>

          {/* Status Info */}
          <div style={styles.statusInfo}>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Status</span>
              <span style={{
                ...styles.statusValue,
                color: ride.rideStatus === 'started' ? '#2ecc71' : '#f39c12',
              }}>
                {ride.rideStatus?.toUpperCase()}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Distance</span>
              <span style={styles.statusValue}>{ride.distance} km</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Fare</span>
              <span style={styles.statusValue}>₹{ride.fare}</span>
            </div>
            {ride.rideStatus === 'started' && (
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Progress</span>
                <span style={styles.statusValue}>{progress}%</span>
              </div>
            )}
          </div>

          {/* Driver Location Coordinates */}
          {driverLocation && (
            <div style={styles.coordsDisplay}>
              Driver Location: [{driverLocation[0]?.toFixed(4)}, {driverLocation[1]?.toFixed(4)}]
            </div>
          )}
        </div>

        {/* Map grid background */}
        <div style={styles.gridBg}></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  mapArea: {
    position: 'relative',
    width: '100%',
    minHeight: '350px',
    background: 'linear-gradient(135deg, #e8f4f8 0%, #d5e8d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  mapOverlay: {
    position: 'relative',
    zIndex: 2,
    width: '90%',
    maxWidth: '600px',
    padding: '2rem',
  },
  route: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  point: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pointDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '3px solid #fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  pointLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#333',
    background: 'rgba(255,255,255,0.9)',
    padding: '4px 12px',
    borderRadius: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  progressTrack: {
    position: 'relative',
    height: '6px',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
    marginLeft: '6px',
    marginTop: '4px',
    marginBottom: '4px',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  driverIcon: {
    position: 'absolute',
    top: '-12px',
    fontSize: '1.3rem',
    transition: 'left 0.5s ease',
    transform: 'translateX(-50%)',
  },
  statusInfo: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  statusLabel: {
    fontSize: '0.8rem',
    color: '#888',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#333',
  },
  coordsDisplay: {
    marginTop: '0.75rem',
    fontSize: '0.7rem',
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
};

export default MapTracker;
