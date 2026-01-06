
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const express = require('express');

const connectDB = require('./config/db');

dotenv.config();
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(cors());
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

app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/users", userRoutes);


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

