
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, distance = 5000, category, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'Latitude and longitude are required'
      });
    }

    const filters = { isApproved: true, isOpen: true };

    if (category) {
      filters.cuisine = category;
    }

    if (search) {
      filters.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find({
      ...filters,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(distance)
        }
      }
    });

    res.status(200).json({
      count: restaurants.length,
      data: restaurants
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      priceRange,
      minRating,
      maxDeliveryFee,
      isOpen,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = { isApproved: true };
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine) {
      filters.cuisine = { $regex: cuisine, $options: 'i' };
    }

    if (priceRange) {
      filters.priceRange = priceRange;
    }

    if (minRating) {
      filters.rating = { $gte: parseFloat(minRating) };
    }

    if (maxDeliveryFee) {
      filters.deliveryFee = { $lte: parseFloat(maxDeliveryFee) };
    }

    if (isOpen !== undefined) {
      filters.isOpen = isOpen === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const restaurants = await Restaurant.find(filters)
      .sort(sortOptions)
      .populate('owner', 'name');

    res.status(200).json({
      count: restaurants.length,
      data: restaurants,
      filters: {
        search,
        cuisine,
        priceRange,
        minRating,
        maxDeliveryFee,
        isOpen,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (!restaurant.isApproved) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const menuItems = await MenuItem.find({
      restaurant: req.params.id,
      isAvailable: true
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
      restaurant,
      menu: menuItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
