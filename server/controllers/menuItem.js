const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');


exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, search } = req.query;

    const filter = {
      restaurant: restaurantId,
      isAvailable: true
    };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const menuItems = await MenuItem
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      count: menuItems.length,
      menu: menuItems
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await MenuItem.create({
      restaurant: restaurantId,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      isVegetarian: req.body.isVegetarian,
      isVegan: req.body.isVegan,
      spicyLevel: req.body.spicyLevel,
      nutritionalInfo: {
        calories: req.body.nutritionalInfo?.calories || 0,
        protein: req.body.nutritionalInfo?.protein || 0,
        carbs: req.body.nutritionalInfo?.carbs || 0,
        fat: req.body.nutritionalInfo?.fat || 0,
        fiber: req.body.nutritionalInfo?.fiber || 0
      }
    });

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.editMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      {
        ...req.body,
        nutritionalInfo: {
          calories: req.body.nutritionalInfo?.calories || 0,
          protein: req.body.nutritionalInfo?.protein || 0,
          carbs: req.body.nutritionalInfo?.carbs || 0,
          fat: req.body.nutritionalInfo?.fat || 0,
          fiber: req.body.nutritionalInfo?.fiber || 0
        }
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem: updatedItem
    });
  } catch (error) {
    console.error('Edit menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
