
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const express = require('express');

const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mern-onlinefood.netlify.app'
  ],
  credentials: true
}));

connectDB();
const authRoutes = require("./routes/auth");
const restaurantRoutes = require('./routes/restaurant');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const feedbackRoutes = require('./routes/feedback');
const deliveryScheduleRoutes = require('./routes/deliverySchedule');
const adminRoutes = require("./routes/admin");
const ownerRoutes = require("./routes/owner");
const favoritesRoutes = require("./routes/favorites");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running successfully", timestamp: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "API is working", timestamp: new Date().toISOString() });
});

app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/delivery-schedules', deliveryScheduleRoutes);
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Node server is running on port ${port}`);
});

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

