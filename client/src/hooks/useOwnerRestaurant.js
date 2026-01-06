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

  const saveMenuItem = async (menuForm, menuItemId) => {
    const payload = {
      ...menuForm,
      nutritionalInfo: {
        calories: menuForm.nutritionalInfo?.calories || 0,
        protein: menuForm.nutritionalInfo?.protein || 0,
        carbs: menuForm.nutritionalInfo?.carbs || 0,
        fat: menuForm.nutritionalInfo?.fat || 0,
        fiber: menuForm.nutritionalInfo?.fiber || 0
      }
    };

    try {
      if (menuItemId) {
        await updateMenuItem(menuItemId, payload);
      } else {
        await addMenuItem(payload);
      }
      fetchRestaurantData();
    } catch (err) {
      console.error("Failed to save menu item", err);
    }
  };

  const removeMenuItem = async (id) => {
    try {
      await deleteMenuItem(id);
      fetchRestaurantData();
    } catch (err) {
      console.error("Failed to delete menu item", err);
    }
  };

  return {
    restaurant,
    menuItems,
    loading,
    saveMenuItem,
    removeMenuItem
  };
}
