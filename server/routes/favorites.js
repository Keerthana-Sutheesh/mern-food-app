const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkFavoriteStatus
} = require("../controllers/favorites");

router.use(protect);
router.post("/", addToFavorites);
router.get("/", getUserFavorites);
router.get("/check/:type/:itemId", checkFavoriteStatus);
router.delete("/:type/:itemId", removeFromFavorites);

module.exports = router;