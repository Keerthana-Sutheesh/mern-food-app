import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/cart";
import { useAuth } from "../context/auth";
import { useHomeRestaurants } from "../hooks/useHomeRestaurants";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);

  const {
    restaurants,
    loading,
    favorites,
    filters,
    setFilters,
    toggleFavorite
  } = useHomeRestaurants(user);

  const [showFilters, setShowFilters] = useState(false);

  const cuisines = [
    "Italian", "Chinese", "Indian", "Mexican",
    "American", "Thai", "Japanese", "Mediterranean"
  ];


  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

  if (user?.role === "owner") {
    navigate("/owner");
    return null;
  }

  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🍕 Food Delivery App</h1>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="btn-primary">Login</Link>
            <Link to="/register" className="btn-secondary">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
   
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name}</h1>
          <button
            onClick={() => navigate("/cart")}
            className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            🛒 Cart ({getTotalItems()})
          </button>
        </div>
      </div>

    
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-4">
          <input
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchTerm: e.target.value }))
            }
            placeholder="Search restaurants..."
            className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <select
            value={filters.selectedCuisine}
            onChange={(e) =>
              setFilters((f) => ({ ...f, selectedCuisine: e.target.value }))
            }
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters((f) => ({ ...f, sortBy, sortOrder }));
            }}
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="deliveryFee-asc">Lowest Delivery Fee</option>
            <option value="name-asc">Name A-Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Filters
          </button>
        </div>
      </div>

    
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <div
              key={r._id}
              onClick={() => navigate(`/restaurant/${r._id.toString()}`)}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg cursor-pointer hover:shadow-md dark:hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{r.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(r._id);
                  }}
                  className="text-2xl"
                >
                  {favorites.has(r._id) ? "❤️" : "🤍"}
                </button>
              </div>

              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{r.cuisine}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">⭐ {r.rating || "New"}</p>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">₹{r.deliveryFee} delivery</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
