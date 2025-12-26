const Favorite = require("../models/Favorite");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

exports.addToFavorites = async (req, res) => {
  try {
    const { type, itemId } = req.body; 

    if (!["restaurant", "menuItem"].includes(type)) {
      return res.status(400).json({ message: "Invalid favorite type" });
    }


    let itemExists = false;
    if (type === "restaurant") {
      itemExists = await Restaurant.findById(itemId);
    } else {
      itemExists = await MenuItem.findById(itemId);
    }

    if (!itemExists) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      [type]: itemId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      [type]: itemId,
      type
    });

    res.status(201).json({
      message: "Added to favorites",
      favorite
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const { type, itemId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      [type]: itemId
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'restaurant',
        select: 'name cuisine rating image priceRange deliveryTime deliveryFee'
      })
      .populate({
        path: 'menuItem',
        select: 'name price image category isAvailable',
        populate: {
          path: 'restaurant',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    const favoriteRestaurants = favorites
      .filter(fav => fav.type === 'restaurant' && fav.restaurant)
      .map(fav => fav.restaurant);

    const favoriteMenuItems = favorites
      .filter(fav => fav.type === 'menuItem' && fav.menuItem)
      .map(fav => ({
        ...fav.menuItem.toObject(),
        restaurantName: fav.menuItem.restaurant?.name
      }));

    res.json({
      restaurants: favoriteRestaurants,
      menuItems: favoriteMenuItems
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { type, itemId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user._id,
      [type]: itemId
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("Check favorite status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};