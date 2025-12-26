const express = require("express");
const router = express.Router();

const {
  getNearbyRestaurants,
  getAllRestaurants,
  getRestaurantById
} = require("../controllers/restaurant");

router.get("/nearby", getNearbyRestaurants);

router.get("/", getAllRestaurants);

router.get("/:id", getRestaurantById);

module.exports = router;

