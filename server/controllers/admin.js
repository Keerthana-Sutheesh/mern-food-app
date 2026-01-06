const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      message: `Restaurant ${isApproved ? "approved" : "rejected"}`,
      restaurant
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const approvedRestaurants = await Restaurant.countDocuments({ isApproved: true });
    const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false });

    res.json({
      stats: {
        totalUsers,
        totalRestaurants,
        approvedRestaurants,
        pendingRestaurants
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
