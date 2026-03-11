/**
 * AdminDashboard Page
 * Admin analytics dashboard with stats cards, user/driver/ride management.
 */

import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setDashboard(response.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await adminAPI.getDrivers();
      setDrivers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  const fetchRides = async () => {
    try {
      const response = await adminAPI.getRides();
      setRides(response.data.data);
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'drivers') fetchDrivers();
    if (activeTab === 'rides') fetchRides();
  }, [activeTab]);

  const handleToggleUser = async (userId) => {
    try {
      await adminAPI.toggleUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user:', err);
    }
  };

  const handleVerifyDriver = async (driverId) => {
    try {
      await adminAPI.verifyDriver(driverId);
      fetchDrivers();
    } catch (err) {
      console.error('Failed to verify driver:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>

        {/* Analytics Cards */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: '#3b82f6' },
            { label: 'Total Drivers', value: stats.totalDrivers || 0, icon: '🚗', color: '#8b5cf6' },
            { label: 'Total Rides', value: stats.totalRides || 0, icon: '🛣️', color: '#06b6d4' },
            { label: 'Active Rides', value: stats.activeRides || 0, icon: '🔄', color: '#f59e0b' },
            { label: 'Completed', value: stats.completedRides || 0, icon: '✅', color: '#10b981' },
            { label: 'Cancelled', value: stats.cancelledRides || 0, icon: '❌', color: '#ef4444' },
            { label: 'Revenue', value: `₹${stats.totalRevenue || 0}`, icon: '💰', color: '#f5c518' },
          ].map((stat, idx) => (
            <div key={idx} style={{ ...styles.statCard, borderLeft: `4px solid ${stat.color}` }}>
              <div style={styles.statTop}>
                <span style={styles.statLabel}>{stat.label}</span>
                <span style={styles.statIcon}>{stat.icon}</span>
              </div>
              <span style={styles.statValue}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'users', 'drivers', 'rides'].map((tab) => (
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

        {/* Overview Tab — Recent Rides */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={styles.sectionTitle}>Recent Rides</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Rider</span>
                <span style={styles.th}>Driver</span>
                <span style={styles.th}>Status</span>
                <span style={styles.th}>Fare</span>
                <span style={styles.th}>Date</span>
              </div>
              {dashboard?.recentRides?.map((ride) => (
                <div key={ride._id} style={styles.tableRow}>
                  <span style={styles.td}>{ride.userId?.name || '—'}</span>
                  <span style={styles.td}>{ride.driverId?.name || 'Unassigned'}</span>
                  <span style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor:
                        ride.rideStatus === 'completed' ? '#d1fae5' :
                        ride.rideStatus === 'cancelled' ? '#fee2e2' : '#fef3c7',
                      color:
                        ride.rideStatus === 'completed' ? '#059669' :
                        ride.rideStatus === 'cancelled' ? '#dc2626' : '#d97706',
                    }}>
                      {ride.rideStatus}
                    </span>
                  </span>
                  <span style={styles.td}>₹{ride.fare}</span>
                  <span style={styles.td}>
                    {new Date(ride.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
              {(!dashboard?.recentRides || dashboard.recentRides.length === 0) && (
                <p style={styles.emptyTable}>No rides yet</p>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 style={styles.sectionTitle}>Manage Users</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Name</span>
                <span style={styles.th}>Email</span>
                <span style={styles.th}>Phone</span>
                <span style={styles.th}>Role</span>
                <span style={styles.th}>Status</span>
                <span style={styles.th}>Action</span>
              </div>
              {users.map((u) => (
                <div key={u._id} style={styles.tableRow}>
                  <span style={styles.td}>{u.name}</span>
                  <span style={styles.td}>{u.email}</span>
                  <span style={styles.td}>{u.phone}</span>
                  <span style={styles.td}>
                    <span style={styles.roleBadge}>{u.role}</span>
                  </span>
                  <span style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: u.isActive ? '#d1fae5' : '#fee2e2',
                      color: u.isActive ? '#059669' : '#dc2626',
                    }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                  <span style={styles.td}>
                    <button
                      onClick={() => handleToggleUser(u._id)}
                      style={styles.actionBtn}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div>
            <h2 style={styles.sectionTitle}>Manage Drivers</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Name</span>
                <span style={styles.th}>Email</span>
                <span style={styles.th}>Vehicle</span>
                <span style={styles.th}>Rating</span>
                <span style={styles.th}>Verified</span>
                <span style={styles.th}>Action</span>
              </div>
              {drivers.map((d) => (
                <div key={d._id} style={styles.tableRow}>
                  <span style={styles.td}>{d.name}</span>
                  <span style={styles.td}>{d.email}</span>
                  <span style={styles.td}>
                    {d.vehicle ? `${d.vehicle.make} ${d.vehicle.model}` : '—'}
                  </span>
                  <span style={styles.td}>★ {d.rating?.toFixed(1)}</span>
                  <span style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: d.isVerified ? '#d1fae5' : '#fef3c7',
                      color: d.isVerified ? '#059669' : '#d97706',
                    }}>
                      {d.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </span>
                  <span style={styles.td}>
                    <button
                      onClick={() => handleVerifyDriver(d._id)}
                      style={styles.actionBtn}
                    >
                      {d.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rides Tab */}
        {activeTab === 'rides' && (
          <div>
            <h2 style={styles.sectionTitle}>All Rides</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Rider</span>
                <span style={styles.th}>Driver</span>
                <span style={styles.th}>Pickup</span>
                <span style={styles.th}>Status</span>
                <span style={styles.th}>Fare</span>
              </div>
              {rides.map((r) => (
                <div key={r._id} style={styles.tableRow}>
                  <span style={styles.td}>{r.userId?.name || '—'}</span>
                  <span style={styles.td}>{r.driverId?.name || 'Unassigned'}</span>
                  <span style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.pickupLocation?.address || '—'}
                  </span>
                  <span style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor:
                        r.rideStatus === 'completed' ? '#d1fae5' :
                        r.rideStatus === 'cancelled' ? '#fee2e2' : '#fef3c7',
                      color:
                        r.rideStatus === 'completed' ? '#059669' :
                        r.rideStatus === 'cancelled' ? '#dc2626' : '#d97706',
                    }}>
                      {r.rideStatus}
                    </span>
                  </span>
                  <span style={styles.td}>₹{r.fare}</span>
                </div>
              ))}
              {rides.length === 0 && (
                <p style={styles.emptyTable}>No rides found</p>
              )}
            </div>
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
    maxWidth: '1100px',
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
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0,
  },
  adminBadge: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#f5c518',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statIcon: { fontSize: '1.3rem' },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#1a1a2e',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderBottom: '3px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#888',
    marginBottom: '-2px',
  },
  tabActive: {
    borderBottomColor: '#f5c518',
    color: '#1a1a2e',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  table: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  tableHeader: {
    display: 'flex',
    padding: '1rem 1.25rem',
    background: '#f8f9fa',
    borderBottom: '2px solid #e5e7eb',
    gap: '1rem',
  },
  th: {
    flex: 1,
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    display: 'flex',
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
    gap: '1rem',
  },
  td: {
    flex: 1,
    fontSize: '0.85rem',
    color: '#444',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: '#e0e7ff',
    color: '#4338ca',
    textTransform: 'capitalize',
  },
  actionBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#666',
  },
  emptyTable: {
    textAlign: 'center',
    padding: '2rem',
    color: '#888',
  },
};

export default AdminDashboard;
