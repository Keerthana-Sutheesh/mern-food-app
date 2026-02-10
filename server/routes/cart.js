const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cart');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:menuItemId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;
