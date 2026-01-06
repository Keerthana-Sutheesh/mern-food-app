import { useEffect, useState, useCallback } from "react";
import {
  getAdminStats,
  getAllRestaurants,
  updateRestaurantStatus,
  getAllUsers
} from "../api/admin";

export function useAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

 
  const fetchStats = useCallback(async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await getAllRestaurants();
      setRestaurants(res.data.restaurants);
    } catch (err) {
      console.error("Failed to fetch restaurants", err);
    }
  };

 
  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  const changeTab = (tab) => {
    setActiveTab(tab);

    if (tab === "restaurants" && restaurants.length === 0) {
      fetchRestaurants();
    }

    if (tab === "users" && users.length === 0) {
      fetchUsers();
    }
  };


  const approveRestaurant = async (id, isApproved) => {
    try {
      await updateRestaurantStatus(id, { isApproved });
      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isApproved } : r
        )
      );
    } catch (err) {
      console.error("Failed to update restaurant status", err);
    }
  };

  return {
    stats,
    restaurants,
    users,
    activeTab,
    loading,
    changeTab,
    approveRestaurant
  };
}
