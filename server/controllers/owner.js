const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      address,
      cuisine,
      description,
      phone,
      image,
      deliveryTime,
      deliveryFee,
      hoursOfOperation,
      priceRange,
      services,
      menuHighlights
    } = req.body;

    if (!name || !address || !cuisine) {
      return res.status(400).json({ message: "Name, address, and cuisine are required" });
    }


    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    if (existingRestaurant) {
   
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        existingRestaurant._id,
        {
          name,
          address,
          cuisine,
          description: description || "",
          phone: phone || "",
          image: image || "",
          deliveryTime: deliveryTime || "30-45 mins",
          deliveryFee: deliveryFee || 40,
          hoursOfOperation: hoursOfOperation || "9:00 AM - 10:00 PM",
          priceRange: priceRange || "$$",
          services: services || [],
          menuHighlights: menuHighlights || [],
          isApproved: false, 
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Restaurant updated successfully, waiting for admin approval",
        restaurant: updatedRestaurant,
      });
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      cuisine,
      description: description || "",
      phone: phone || "",
      image: image || "",
      deliveryTime: deliveryTime || "30-45 mins",
      deliveryFee: deliveryFee || 40,
      hoursOfOperation: hoursOfOperation || "9:00 AM - 10:00 PM",
      priceRange: priceRange || "$$",
      services: services || [],
      menuHighlights: menuHighlights || [],
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Restaurant created, waiting for admin approval",
      restaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const updates = req.body;
    delete updates.owner; 
    delete updates.isApproved; 

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant._id,
      updates,
      { new: true }
    );

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurant: restaurant._id
    });

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurant._id });
    res.json({ menuItems });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

   
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
    res.json({
      message: "Menu item updated successfully",
      menuItem: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

   
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
