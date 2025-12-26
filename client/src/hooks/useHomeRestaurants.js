import { useEffect, useState, useCallback } from "react";
import {
  getRestaurants,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} from "../api/restaurant";

export function useHomeRestaurants(user) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedCuisine: "",
    priceRange: "",
    minRating: "",
    maxDeliveryFee: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const fetchRestaurants = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );

      const res = await getRestaurants(params);
      const data = res.data.data;
      setRestaurants(data);

      if (user) {
        const favSet = new Set();
        await Promise.all(
          data.map(async (r) => {
            try {
              const favRes = await checkFavoriteStatus("restaurant", r._id);
              if (favRes.data.isFavorited) {
                favSet.add(r._id);
              }
            } catch {}
          })
        );
        setFavorites(favSet);
      }
    } catch (err) {
      console.error("Failed to fetch restaurants", err);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const toggleFavorite = async (restaurantId) => {
    if (!user) return;

    try {
      if (favorites.has(restaurantId)) {
        await removeFromFavorites("restaurant", restaurantId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
      } else {
        await addToFavorites({ type: "restaurant", itemId: restaurantId });
        setFavorites((prev) => new Set([...prev, restaurantId]));
      }
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  return {
    restaurants,
    loading,
    favorites,
    filters,
    setFilters,
    toggleFavorite
  };
}
