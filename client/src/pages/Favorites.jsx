import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserFavorites, removeFromFavorites } from "../api/favorites";

export default function Favorites() {
  const [favorites, setFavorites] = useState({ restaurants: [], menuItems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await getUserFavorites();
      setFavorites(res.data);
    } catch (err) {
      setError("Failed to load favorites");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (type, itemId) => {
    try {
      await removeFromFavorites(type, itemId);

      if (type === "restaurant") {
        setFavorites(prev => ({
          ...prev,
          restaurants: prev.restaurants.filter(r => r._id !== itemId)
        }));
      } else {
        setFavorites(prev => ({
          ...prev,
          menuItems: prev.menuItems.filter(item => item._id !== itemId)
        }));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 max-w-md">
          <div className="text-3xl mb-4">😞</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              My Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              Your personalized collection of favorite restaurants and dishes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Favorite Restaurants */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent whitespace-nowrap flex items-center gap-2">
              <span className="text-xl">🏪</span>
              Favorite Restaurants
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>

          {favorites.restaurants.length === 0 ? (
            <div className="text-center py-16 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-white/20 dark:border-gray-700/50">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No favorite restaurants yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Start exploring and add some restaurants to your favorites!
              </p>
              <Link
                to="/"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>🔍</span>
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.restaurants.map(restaurant => (
                <div
                  key={restaurant._id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg inline-block">
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite("restaurant", restaurant._id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-110"
                        title="Remove from favorites"
                      >
                        <span className="text-lg">💔</span>
                      </button>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-lg">⭐</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {restaurant.rating?.toFixed(1) || 'New'}
                        </span>
                        {restaurant.rating && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({Math.floor(Math.random() * 500) + 50} reviews)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {restaurant.deliveryTime || `${Math.floor(Math.random() * 45) + 15} min`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 dark:text-green-400">🚚</span>
                          <span className="text-gray-600 dark:text-gray-300">
                            ₹{restaurant.deliveryFee} delivery
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/restaurant/${restaurant._id?.toString()}`}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 shadow-md font-semibold text-center block flex items-center justify-center gap-2"
                    >
                      <span>🍽️</span>
                      View Menu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Menu Items */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent whitespace-nowrap flex items-center gap-2">
              <span className="text-xl">🍕</span>
              Favorite Menu Items
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>

          {favorites.menuItems.length === 0 ? (
            <div className="text-center py-16 backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-white/20 dark:border-gray-700/50">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No favorite menu items yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Discover delicious dishes and add them to your favorites!
              </p>
              <Link
                to="/"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>🔍</span>
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.menuItems.map(item => (
                <div
                  key={item._id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          from <span className="font-medium text-orange-600 dark:text-orange-400">{item.restaurantName}</span>
                        </p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ₹{item.price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite("menuItem", item._id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-110"
                        title="Remove from favorites"
                      >
                        <span className="text-lg">💔</span>
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium capitalize">
                        {item.category?.replace('_', ' ') || 'Other'}
                      </span>
                      {!item.isAvailable && (
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/restaurant/${item.restaurant?.toString()}`}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl hover:shadow-lg disabled:hover:shadow-none transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md font-semibold text-center block flex items-center justify-center gap-2"
                      onClick={(e) => !item.isAvailable && e.preventDefault()}
                    >
                      <span>🏪</span>
                      View in Restaurant
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}