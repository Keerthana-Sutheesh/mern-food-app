import { useEffect, useState, useCallback } from "react";
import {
  getMyRestaurant,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} from "../api/restaurant";

export function useOwnerRestaurant() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurantData = useCallback(async () => {
    try {
      setLoading(true);
      const [restaurantRes, menuRes] = await Promise.all([
        getMyRestaurant(),
        getMenuItems()
      ]);

      setRestaurant(restaurantRes.data.restaurant);
      setMenuItems(menuRes.data.menuItems);
    } catch (err) {
      console.error("Failed to fetch restaurant data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const saveMenuItem = async (item, editingId) => {
    if (editingId) {
      await updateMenuItem(editingId, item);
    } else {
      await addMenuItem(item);
    }
    fetchRestaurantData();
  };

  const removeMenuItem = async (id) => {
    await deleteMenuItem(id);
    fetchRestaurantData();
  };

  return {
    restaurant,
    menuItems,
    loading,
    saveMenuItem,
    removeMenuItem
  };
}
