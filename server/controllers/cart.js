const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.menuItem');

    res.status(200).json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, customizations, specialInstructions } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem || !menuItem.available) {
      return res.status(404).json({ message: 'Menu item not available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

 
    if (customizations && customizations.length > 0) {
      cart.items.push({
        menuItem: menuItemId,
        quantity,
        price: menuItem.price,
        customizations: customizations || [],
        specialInstructions: specialInstructions || ''
      });
    } else {
     
      const existingItem = cart.items.find(
        item => item.menuItem.toString() === menuItemId && 
               (!item.customizations || item.customizations.length === 0)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          menuItem: menuItemId,
          quantity,
          price: menuItem.price,
          customizations: [],
          specialInstructions: ''
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(
      i => i.menuItem.toString() === menuItemId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.menuItem.toString() !== req.params.menuItemId
    );

    await cart.save();
    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
