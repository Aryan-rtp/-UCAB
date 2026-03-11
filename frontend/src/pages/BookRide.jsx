/**
 * BookRide Page
 * Main booking page that wraps BookingForm and handles post-booking navigation.
 */

import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const BookRide = () => {
  const navigate = useNavigate();

  const handleBookingComplete = (bookingData) => {
    const rideId = bookingData.ride._id;
    navigate(`/ride/${rideId}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <h1 style={styles.heading}>Where to?</h1>
          <p style={styles.subheading}>
            Enter your pickup and drop locations to get instant fare estimates
            across all vehicle types.
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Transparent pricing — no hidden charges</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Verified, background-checked drivers</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Real-time ride tracking</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Multiple payment options</span>
            </div>
          </div>
        </div>

        <div style={styles.rightSection}>
          <BookingForm onBookingComplete={handleBookingComplete} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '3rem 2rem',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    gap: '3rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftSection: {
    flex: 1,
    minWidth: '300px',
    paddingTop: '1rem',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  subheading: {
    fontSize: '1.05rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#444',
  },
  featureIcon: {
    color: '#2ecc71',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  rightSection: {
    flex: 1,
    minWidth: '340px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

export default BookRide;
