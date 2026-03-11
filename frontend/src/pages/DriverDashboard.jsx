/**
 * DriverDashboard Page
 * Driver's main dashboard for managing ride requests, tracking earnings,
 * and updating ride statuses.
 */

import { useState, useEffect } from 'react';
import { driverAPI, rideAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import RideCard from '../components/RideCard';

const DriverDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await driverAPI.getRequests();
      setRequests(response.data.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await driverAPI.getEarnings();
      setEarnings(response.data.data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchEarnings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Listen for new ride requests via socket
  useEffect(() => {
    if (!socket) return;

    socket.on('newRideRequest', (ride) => {
      setRequests((prev) => [ride, ...prev]);
    });

    return () => {
      socket.off('newRideRequest');
    };
  }, [socket]);

  const handleAccept = async (rideId) => {
    try {
      await driverAPI.accept(rideId);
      fetchRequests();
    } catch (err) {
      console.error('Failed to accept ride:', err);
    }
  };

  const handleReject = async (rideId) => {
    try {
      await driverAPI.reject(rideId);
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject ride:', err);
    }
  };

  const handleStart = async (rideId) => {
    try {
      await rideAPI.start(rideId);
      fetchRequests();
    } catch (err) {
      console.error('Failed to start ride:', err);
    }
  };

  const handleComplete = async (rideId) => {
    try {
      await rideAPI.complete(rideId);
      fetchRequests();
      fetchEarnings();
    } catch (err) {
      console.error('Failed to complete ride:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>Driver Dashboard</h1>
            <p style={styles.subtext}>Welcome, {user?.name}</p>
          </div>
          <div style={styles.onlineBadge}>
            <span style={styles.onlineDot}></span> Online
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <span style={{ ...styles.statNum, color: '#f5c518' }}>
              ₹{earnings?.summary?.totalEarnings || 0}
            </span>
            <span style={{ ...styles.statLabel, color: '#aaa' }}>Total Earnings</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{earnings?.summary?.totalRides || 0}</span>
            <span style={styles.statLabel}>Rides Completed</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>★ {earnings?.summary?.rating?.toFixed(1) || '5.0'}</span>
            <span style={styles.statLabel}>Rating</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{requests.length}</span>
            <span style={styles.statLabel}>Active Requests</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.tabActive : {}) }}
          >
            Ride Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }}
          >
            Ride History
          </button>
        </div>

        {/* Content */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyIcon}>🚕</p>
                <p style={styles.emptyText}>No active ride requests</p>
                <p style={styles.emptySubtext}>New requests will appear here automatically</p>
              </div>
            ) : (
              requests.map((ride) => (
                <div key={ride._id} style={styles.requestCard}>
                  <RideCard
                    ride={ride}
                    showActions={true}
                    onAction={{
                      onStart: handleStart,
                      onComplete: handleComplete,
                      onCancel: (rideId) => handleReject(rideId),
                    }}
                  />
                  {ride.rideStatus === 'requested' && (
                    <div style={styles.driverActions}>
                      <button
                        onClick={() => handleAccept(ride._id)}
                        style={styles.acceptBtn}
                      >
                        Accept Ride
                      </button>
                      <button
                        onClick={() => handleReject(ride._id)}
                        style={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {earnings?.rides?.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyText}>No completed rides yet</p>
              </div>
            ) : (
              earnings?.rides?.map((ride) => (
                <RideCard key={ride._id} ride={ride} showActions={false} />
              ))
            )}
          </div>
        )}
      </div>
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
    maxWidth: '900px',
    margin: '0 auto',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  greeting: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0,
  },
  subtext: { color: '#888', fontSize: '0.9rem', margin: 0 },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#d1fae5',
    borderRadius: '20px',
    color: '#059669',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#059669',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statNum: { fontSize: '1.5rem', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: '0.75rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#666',
  },
  tabActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
    color: '#1a1a2e',
  },
  requestCard: {
    marginBottom: '1rem',
  },
  driverActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '-0.5rem',
    marginBottom: '0.5rem',
  },
  acceptBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#059669',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  rejectBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    color: '#666',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '3rem', margin: 0 },
  emptyText: { color: '#888', fontSize: '1.1rem', margin: '0.5rem 0' },
  emptySubtext: { color: '#bbb', fontSize: '0.85rem', margin: 0 },
};

export default DriverDashboard;
