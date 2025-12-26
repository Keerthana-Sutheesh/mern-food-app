const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { authorize } = require("../middlewares/roles");
const {
  getAllRestaurants,
  updateRestaurantStatus,
  getAllUsers,
  updateUserRole,
  getDashboardStats
} = require("../controllers/admin");

router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Admin dashboard access granted",
    user: req.user,
  });
});


router.get("/stats", protect, authorize("admin"), getDashboardStats);


router.get("/restaurants", protect, authorize("admin"), getAllRestaurants);
router.put("/restaurants/:id/status", protect, authorize("admin"), updateRestaurantStatus);


router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);

module.exports = router;
