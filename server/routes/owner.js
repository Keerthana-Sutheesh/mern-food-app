const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { authorize } = require("../middlewares/roles");
const {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/owner");

router.post(
  "/restaurant",
  protect,
  authorize("owner"),
  createRestaurant
);

router.get(
  "/restaurant",
  protect,
  authorize("owner"),
  getMyRestaurant
);

router.put(
  "/restaurant",
  protect,
  authorize("owner"),
  updateRestaurant
);


router.post(
  "/menu",
  protect,
  authorize("owner"),
  addMenuItem
);

router.get(
  "/menu",
  protect,
  authorize("owner"),
  getMenuItems
);

router.put(
  "/menu/:id",
  protect,
  authorize("owner"),
  updateMenuItem
);

router.delete(
  "/menu/:id",
  protect,
  authorize("owner"),
  deleteMenuItem
);

module.exports = router;
