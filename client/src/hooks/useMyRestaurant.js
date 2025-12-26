import { useEffect, useState } from "react";
import { getMyRestaurant } from "../api/restaurant";

export function useMyRestaurant(setForm) {
  const [existingRestaurant, setExistingRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await getMyRestaurant();
        const restaurant = res.data.restaurant;

        setExistingRestaurant(restaurant);
        setForm({
          name: restaurant.name || "",
          address: restaurant.address || "",
          cuisine: restaurant.cuisine || "",
          description: restaurant.description || "",
          phone: restaurant.phone || "",
          image: restaurant.image || "",
          deliveryTime: restaurant.deliveryTime || "30-45 mins",
          deliveryFee: restaurant.deliveryFee || 40,
          hoursOfOperation: restaurant.hoursOfOperation || "9:00 AM - 10:00 PM",
          priceRange: restaurant.priceRange || "$$",
          services: restaurant.services || [],
          menuHighlights: restaurant.menuHighlights || [],
        });
      } catch {
        setExistingRestaurant(null);
      }
    };

    fetchRestaurant();
  }, [setForm]);

  return existingRestaurant;
}
