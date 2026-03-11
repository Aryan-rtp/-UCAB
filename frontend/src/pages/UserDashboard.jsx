/**
 * UserDashboard Page
 * Rider's main dashboard showing ride history, quick actions, and stats.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rideAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RideCard from '../components/RideCard';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchRides = async (page = 1) => {
    setLoading(true);
    try {
      const response = await rideAPI.getUserRides(page, 10);
      setRides(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleCancel = async (rideId) => {
    try {
      await rideAPI.cancel(rideId, 'Cancelled by rider');
      fetchRides();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const handlePay = async (rideId) => {
    navigate(`/ride/${rideId}`);
  };

  const filteredRides = activeTab === 'all'
    ? rides
    : rides.filter((r) => r.rideStatus === activeTab);

  const stats = {
    total: rides.length,
    completed: rides.filter((r) => r.rideStatus === 'completed').length,
    active: rides.filter((r) => ['requested', 'accepted', 'started'].includes(r.rideStatus)).length,
    spent: rides
      .filter((r) => r.rideStatus === 'completed')
      .reduce((sum, r) => sum + r.fare, 0),
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>Hello, {user?.name} 👋</h1>
            <p style={styles.subtext}>Here's your ride summary</p>
          </div>
          <Link to="/book" style={styles.bookBtn}>
            + Book a Ride
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🚕</span>
            <span style={styles.statNum}>{stats.total}</span>
            <span style={styles.statLabel}>Total Rides</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <span style={styles.statNum}>{stats.completed}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🔄</span>
            <span style={styles.statNum}>{stats.active}</span>
            <span style={styles.statLabel}>Active</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>💰</span>
            <span style={styles.statNum}>₹{stats.spent}</span>
            <span style={styles.statLabel}>Total Spent</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['all', 'requested', 'accepted', 'started', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Ride List */}
        <div style={styles.rideList}>
          {loading ? (
            <p style={styles.loadingText}>Loading rides...</p>
          ) : filteredRides.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No rides found</p>
              <Link to="/book" style={styles.emptyBtn}>Book your first ride</Link>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <div key={ride._id} onClick={() => {
                if (['requested', 'accepted', 'started'].includes(ride.rideStatus)) {
                  navigate(`/ride/${ride._id}`);
                }
              }} style={{ cursor: ['requested','accepted','started'].includes(ride.rideStatus) ? 'pointer' : 'default' }}>
                <RideCard
                  ride={ride}
                  showActions={true}
                  onAction={{
                    onCancel: handleCancel,
                    onPay: handlePay,
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchRides(p)}
                style={{
                  ...styles.pageBtn,
                  ...(pagination.page === p ? styles.pageBtnActive : {}),
                }}
              >
                {p}
              </button>
            ))}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  greeting: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0,
  },
  subtext: {
    color: '#888',
    fontSize: '0.9rem',
    margin: 0,
  },
  bookBtn: {
    background: '#f5c518',
    color: '#1a1a2e',
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
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
  statIcon: { fontSize: '1.5rem' },
  statNum: { fontSize: '1.5rem', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: '0.75rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#666',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
    color: '#1a1a2e',
  },
  rideList: {},
  loadingText: { textAlign: 'center', color: '#888', padding: '2rem' },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: '12px',
  },
  emptyText: { color: '#888', fontSize: '1.1rem', marginBottom: '1rem' },
  emptyBtn: {
    display: 'inline-block',
    background: '#f5c518',
    color: '#1a1a2e',
    padding: '10px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  pageBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
  },
  pageBtnActive: {
    borderColor: '#f5c518',
    background: '#fffbeb',
    color: '#1a1a2e',
  },
};

export default UserDashboard;
