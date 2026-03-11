# UCAB - Cab Booking Platform

A production-quality MERN stack cab booking web application with real-time tracking, role-based access control, and a modern SaaS-style UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Real-time | Socket.io |
| Security | JWT, bcryptjs |
| Styling | CSS-in-JS (inline styles, no external dependency) |

---

## Architecture

```
Client (React) → API Layer (Express REST) → Service Layer → Data Access (Mongoose) → MongoDB Atlas
                      ↕
                  Socket.io (real-time events)
```

### Backend (MVC + Service Layer)

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── adminController.js       # Admin dashboard & management
│   ├── authController.js        # Register, login, profile
│   ├── driverController.js      # Driver ride management
│   ├── paymentController.js     # Payment processing
│   └── rideController.js        # Ride lifecycle
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   ├── errorHandler.js          # Global error handler
│   └── roleMiddleware.js        # Role-based access control
├── models/
│   ├── Driver.js                # Driver schema (2dsphere index)
│   ├── Payment.js               # Payment transaction schema
│   ├── Ride.js                  # Ride schema with status lifecycle
│   ├── User.js                  # User/Rider schema
│   └── Vehicle.js               # Vehicle schema (1:1 with Driver)
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── driverRoutes.js
│   ├── paymentRoutes.js
│   ├── rideRoutes.js
│   └── userRoutes.js
├── services/
│   ├── fareCalculationService.js  # Fare formula + Haversine distance
│   └── rideMatchingService.js     # Geospatial driver matching
├── tests/
│   └── api.test.js              # Jest + Supertest integration tests
├── server.js                    # Express + Socket.io entry point
├── package.json
└── .env.example
```

### Frontend (Component-Based)

```
frontend/
├── src/
│   ├── components/
│   │   ├── BookingForm.jsx      # Location + vehicle + fare estimation
│   │   ├── MapTracker.jsx       # Simulated live ride tracking
│   │   ├── Navbar.jsx           # Role-aware navigation bar
│   │   └── RideCard.jsx         # Ride summary card with actions
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state management
│   │   └── SocketContext.jsx    # Socket.io connection management
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Admin analytics + management
│   │   ├── BookRide.jsx         # Ride booking page
│   │   ├── DriverDashboard.jsx  # Driver request management
│   │   ├── Home.jsx             # Landing page
│   │   ├── Login.jsx            # Multi-role login
│   │   ├── RideTracking.jsx     # Live ride tracking + payment
│   │   ├── Signup.jsx           # Rider/Driver registration
│   │   └── UserDashboard.jsx    # Rider history + stats
│   ├── services/
│   │   └── api.js               # Axios instance + API modules
│   ├── App.jsx                  # Router + route protection
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.js
└── package.json
```

---

## Database Design (ER Relationships)

```
User ──(1:N)──> Ride ──(1:1)──> Payment
                  ↑
Driver ──(1:N)──┘
   │
   └──(1:1)──> Vehicle
```

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Ride | One-to-Many | One user books multiple rides |
| Driver → Ride | One-to-Many | One driver completes many rides |
| Driver → Vehicle | One-to-One | Each driver has one vehicle |
| Ride → Payment | One-to-One | Each ride has one payment |

### Ride Status Lifecycle

```
requested → accepted → started → completed
    ↓           ↓         ↓
 cancelled   cancelled  (cannot cancel after start)
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register rider or driver |
| POST | `/api/auth/login` | Login (rider/driver/admin) |

### User (Rider)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| GET | `/api/users/rides` | Get ride history (paginated) |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rides/book` | Book a new ride |
| GET | `/api/rides/estimate` | Get fare estimates |
| GET | `/api/rides/:id` | Get ride details |
| GET | `/api/rides/history` | Ride history (paginated) |
| POST | `/api/rides/cancel` | Cancel a ride |
| POST | `/api/rides/start` | Start a ride (driver) |
| POST | `/api/rides/complete` | Complete a ride (driver) |

### Driver
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/driver/requests` | Get assigned ride requests |
| POST | `/api/driver/accept` | Accept a ride request |
| POST | `/api/driver/reject` | Reject a ride request |
| PUT | `/api/driver/location` | Update current location |
| GET | `/api/driver/earnings` | Get earnings summary |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/process` | Process ride payment |
| GET | `/api/payments/history` | Payment history (paginated) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Analytics summary |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/drivers` | List all drivers |
| GET | `/api/admin/rides` | List all rides (filterable) |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| PUT | `/api/admin/drivers/:id/verify` | Verify/unverify driver |

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/ucab?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or allow all with `0.0.0.0/0`)
5. Get the connection string and paste into `MONGO_URI`

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend runs at: `http://localhost:5000`
- Frontend runs at: `http://localhost:5173`

### 5. Create an Admin User

Register a user, then manually update their role in MongoDB:

```javascript
// In MongoDB Atlas console or mongosh:
db.users.updateOne(
  { email: "admin@ucab.com" },
  { $set: { role: "admin" } }
)
```

---

## Fare Calculation

```
Fare = (Base Fare + Distance x Rate per km) x Surge Multiplier
```

| Vehicle | Base Fare | Rate/km |
|---------|-----------|---------|
| Bike | ₹20 | ₹6 |
| Auto | ₹30 | ₹9 |
| Hatchback | ₹40 | ₹10 |
| Sedan | ₹50 | ₹12 |
| SUV | ₹80 | ₹16 |

Distance is calculated using the **Haversine formula** for geographic coordinates.

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover: registration, login, profile, ride booking, fare estimation, and health check.

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy via Vercel CLI or connect GitHub repo at vercel.com
# Set environment variable: VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render

1. Connect your GitHub repo at [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env`

### Database → MongoDB Atlas

Already configured via `MONGO_URI`. Ensure network access allows your deployment platform's IP.

---

## Security Features

- **JWT authentication** with configurable expiry
- **bcrypt** password hashing (12 salt rounds)
- **Role-based access control** (rider, driver, admin)
- **CORS** configured for frontend origin
- **Input validation** via Mongoose schema validators
- **Password exclusion** from query results by default
- **Environment variables** via dotenv (secrets never in code)

## Performance Optimizations

- **MongoDB indexes**: 2dsphere (driver location), compound indexes on frequently queried fields
- **Pagination**: All list endpoints support `page` and `limit` query params
- **Selective population**: Only required fields are populated from references
- **Connection pooling**: Mongoose configured with `maxPoolSize: 10`
