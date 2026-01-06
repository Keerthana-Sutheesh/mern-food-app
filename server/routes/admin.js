const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { authorize } = require("../middlewares/roles");

const {
  getAllRestaurants,
  updateRestaurantStatus,
  getAllUsers,
  getDashboardStats
} = require("../controllers/admin");

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);

router.get("/restaurants", getAllRestaurants);
router.put("/restaurants/:id/status", updateRestaurantStatus);

router.get("/users", getAllUsers);

module.exports = router;
