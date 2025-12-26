const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cart');


router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.put('/update', auth, updateCartItem);
router.delete('/remove/:menuItemId', auth, removeCartItem);
router.delete('/clear', auth, clearCart);

module.exports = router;
