const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const roles = require('../middlewares/roles');

const {
  getMenuByRestaurant,
  getMenuItemById,
  addMenuItem,
  updateMenuItem
} = require('../controllers/menuItem');

router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/:id', getMenuItemById);
router.post('/',addMenuItem);
router.put('/:id', updateMenuItem);

module.exports = router;
