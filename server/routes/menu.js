const express = require('express');
const router = express.Router();


const {
  getMenuByRestaurant,
  getMenuItemById,
  addMenuItem,
editMenuItem 
} = require('../controllers/menuItem');


router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/:id', getMenuItemById);

router.post(
  '/restaurant/:restaurantId',
 
  addMenuItem
);

router.put(
  '/:id',

  editMenuItem
);


module.exports = router;
