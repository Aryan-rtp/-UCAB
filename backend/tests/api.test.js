/**
 * API Integration Tests
 * Uses Jest + Supertest to test core API endpoints.
 *
 * Run: npm test (from backend directory)
 *
 * Prerequisites:
 * - Set MONGO_URI to a test database in .env
 * - The server should NOT be running separately (supertest handles it)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const { app } = require('../server');

let riderToken;
let driverToken;
let rideId;

// Unique test emails to avoid conflicts
const testRiderEmail = `testrider_${Date.now()}@test.com`;
const testDriverEmail = `testdriver_${Date.now()}@test.com`;

describe('UCAB API Tests', () => {
  // ─── Auth Tests ──────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should register a new rider', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Rider',
          email: testRiderEmail,
          password: 'password123',
          phone: '9876543210',
          role: 'rider',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      riderToken = res.body.data.token;
    });

    it('should register a new driver', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Driver',
          email: testDriverEmail,
          password: 'password123',
          phone: '9876543211',
          role: 'driver',
          licenseNumber: `LIC_${Date.now()}`,
          vehicle: {
            make: 'Maruti',
            model: 'Swift',
            year: 2023,
            color: 'White',
            plateNumber: `KA01${Date.now().toString().slice(-4)}`,
            vehicleType: 'sedan',
          },
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      driverToken = res.body.data.token;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Rider',
          email: testRiderEmail,
          password: 'password123',
          phone: '9876543212',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing rider', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testRiderEmail,
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('rider');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testRiderEmail,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Profile Tests ────────────────────────────────────────────────

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(testRiderEmail);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Ride Tests ────────────────────────────────────────────────────

  describe('POST /api/rides/book', () => {
    it('should book a ride', async () => {
      const res = await request(app)
        .post('/api/rides/book')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({
          pickupAddress: 'MG Road, Bangalore',
          pickupCoordinates: [77.5946, 12.9716],
          dropAddress: 'Whitefield, Bangalore',
          dropCoordinates: [77.7500, 12.9698],
          vehicleType: 'sedan',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ride).toBeDefined();
      expect(res.body.data.fareDetails).toBeDefined();
      rideId = res.body.data.ride._id;
    });
  });

  describe('GET /api/rides/:id', () => {
    it('should return ride details', async () => {
      const res = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(rideId);
    });
  });

  describe('GET /api/rides/history', () => {
    it('should return user ride history', async () => {
      const res = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  // ─── Fare Estimate Tests ───────────────────────────────────────────

  describe('GET /api/rides/estimate', () => {
    it('should return fare estimates', async () => {
      const res = await request(app)
        .get('/api/rides/estimate')
        .set('Authorization', `Bearer ${riderToken}`)
        .query({
          pickupCoordinates: '77.5946,12.9716',
          dropCoordinates: '77.7500,12.9698',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.distance).toBeDefined();
      expect(Array.isArray(res.body.data.estimates)).toBe(true);
    });
  });

  // ─── Health Check ──────────────────────────────────────────────────

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // ─── Cleanup ───────────────────────────────────────────────────────

  afterAll(async () => {
    // Clean up test data
    const User = require('../models/User');
    const Driver = require('../models/Driver');
    const Vehicle = require('../models/Vehicle');
    const Ride = require('../models/Ride');

    await User.deleteMany({ email: testRiderEmail });
    await Driver.deleteMany({ email: testDriverEmail });

    await mongoose.connection.close();
  });
});
