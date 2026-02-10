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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50">
          <div className="mb-6">
            <div className="text-4xl mb-4">🍕</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Food Delivery App
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              Delicious food delivered to your doorstep
            </p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-orange-500 hover:border-orange-600 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading delicious options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Discover amazing restaurants near you</p>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">🛒</span>
              Cart ({getTotalItems()})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search Restaurants
              </label>
              <input
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, searchTerm: e.target.value }))
                }
                placeholder="Search by name, cuisine, or location..."
                className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300"
              />
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cuisine
              </label>
              <select
                value={filters.selectedCuisine}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, selectedCuisine: e.target.value }))
                }
                className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300"
              >
                <option value="">All Cuisines</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters((f) => ({ ...f, sortBy, sortOrder }));
                }}
                className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="deliveryFee-asc">Lowest Delivery Fee</option>
                <option value="name-asc">Name A-Z</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="mr-2">🔍</span>
              Filters
            </button>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <div
              key={r._id}
              onClick={() => navigate(`/restaurant/${r._id.toString()}`)}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {r.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg inline-block">
                    {r.cuisine}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(r._id);
                  }}
                  className="text-2xl transition-transform duration-300 hover:scale-110 p-1"
                >
                  {favorites.has(r._id) ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {r.rating || "New"}
                  </span>
                  {r.rating && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({Math.floor(Math.random() * 500) + 50} reviews)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      ₹{r.deliveryFee}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      delivery fee
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(Math.random() * 45) + 15} min
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Free delivery above ₹499
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    View Menu →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => setFilters({ searchTerm: '', selectedCuisine: '', sortBy: 'createdAt', sortOrder: 'desc' })}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
