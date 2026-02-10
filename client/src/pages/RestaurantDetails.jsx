import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById } from "../api/restaurant";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "../api/favorites";
import api from "../api/api";
import { CartContext } from "../context/cart";
import { useAuth } from "../context/auth";
import RestaurantFeedback from "../components/RestaurantFeedback";

export default function RestaurantDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useContext(CartContext);

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [menuItemFavorites, setMenuItemFavorites] = useState(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return; 
      
      try {
        setLoading(true);
        const res = await getRestaurantById(id);
        const restaurantData = res.data.restaurant || res.data;
        const menuData = res.data.menu || [];
        
        setRestaurant(restaurantData);
        setMenu(menuData);

        if (user && restaurantData) {
          const ownerId = restaurantData.owner?._id || restaurantData.owner;
          setIsOwner(ownerId?.toString() === (user._id || user.id)?.toString());
          const favRes = await checkFavoriteStatus("restaurant", id);
          setIsFavorited(favRes.data.isFavorited);
        }
      } catch (err) {
        setError("Failed to load restaurant details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRestaurantData();
  }, [id, user]);

  useEffect(() => {
    const fetchMenuItemFavorites = async () => {
      if (!user || !menu.length) return;
      
      try {
        const favoriteStatuses = await Promise.all(
          menu.map(item => checkFavoriteStatus("menuItem", item._id))
        );
        
        const favoritesSet = new Set();
        favoriteStatuses.forEach((res, index) => {
          if (res.data.isFavorited) {
            favoritesSet.add(menu[index]._id);
          }
        });
        
        setMenuItemFavorites(favoritesSet);
      } catch (error) {
        console.error("Error loading menu item favorites:", error);
      }
    };

    fetchMenuItemFavorites();
  }, [user, menu]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id || isOwner || typeof id !== 'string') return;
      try {
        const res = await api.get(`/orders/current/${id}`);
        setCurrentOrder(res.data);
      } catch (err) {
        console.log("No order found for this user.");
        setCurrentOrder(null);
      }
    };
    if (user && id && typeof id === 'string' && !isOwner) {
      fetchOrder();
    }
  }, [id, user, isOwner]);

  const handleAddToCart = (item) => {
  addToCart({
    menuItem: item._id,          
    name: item.name,
    price: item.price,
    quantity: 1,
    restaurant: restaurant._id,
    restaurantName: restaurant.name,
    customizations: item.customizations || [],
    specialInstructions: item.specialInstructions || ""
  });
};

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      if (isFavorited) {
        await removeFromFavorites("restaurant", restaurant._id);
        setIsFavorited(false);
      } else {
        await addToFavorites({ type: "restaurant", itemId: restaurant._id });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    }
  };

  const handleToggleMenuItemFavorite = async (itemId) => {
    if (!user) return;
    try {
      const isCurrentlyFavorited = menuItemFavorites.has(itemId);
      if (isCurrentlyFavorited) {
        await removeFromFavorites("menuItem", itemId);
        setMenuItemFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        await addToFavorites({ type: "menuItem", itemId });
        setMenuItemFavorites(prev => new Set([...prev, itemId]));
      }
    } catch (error) {
      console.error("Menu item favorite toggle error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 max-w-md">
          <div className="text-4xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || "Restaurant not found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The restaurant you're looking for doesn't exist or has been removed.
          </p>
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

  const menuByCategory = menu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">

      {/* Restaurant Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {restaurant.name}
                </h1>
                {user && (
                  <button
                    onClick={handleToggleFavorite}
                    className="text-3xl transition-transform duration-300 hover:scale-110 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isFavorited ? '❤️' : '🤍'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                  {restaurant.cuisine}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">📍</span>
                  {restaurant.address}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {restaurant.rating || "New"}
                  </span>
                  {restaurant.rating && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ({Math.floor(Math.random() * 500) + 50} reviews)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">🚚</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{restaurant.deliveryFee} delivery
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">⏱️</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(Math.random() * 45) + 15} min
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/cart"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">🛒</span>
              View Cart
            </Link>
          </div>
        </div>
      </div>


      {/* Menu Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent whitespace-nowrap">
                {category}
              </h3>
              <div className="h-1 flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <div
                  key={item._id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 flex flex-col justify-between hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h4>
                        {user && (
                          <button
                            onClick={() => handleToggleMenuItemFavorite(item._id)}
                            className="text-2xl transition-transform duration-300 hover:scale-110 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {menuItemFavorites.has(item._id) ? '❤️' : '🤍'}
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-4 leading-relaxed">
                      {item.description}
                    </p>

                 
                    {item.nutritionalInfo && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl text-xs border border-gray-200 dark:border-gray-600">
                        <p className="font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-tight flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          Nutritional Value
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-gray-800 dark:text-gray-200 font-medium">
                          {item.nutritionalInfo.calories && (
                            <span className="flex items-center gap-1">
                              <span>🔥</span>
                              {item.nutritionalInfo.calories} cal
                            </span>
                          )}
                          {item.nutritionalInfo.protein && (
                            <span className="flex items-center gap-1">
                              <span>💪</span>
                              {item.nutritionalInfo.protein}g protein
                            </span>
                          )}
                          {item.nutritionalInfo.carbs && (
                            <span className="flex items-center gap-1">
                              <span>🍞</span>
                              {item.nutritionalInfo.carbs}g carbs
                            </span>
                          )}
                          {item.nutritionalInfo.fat && (
                            <span className="flex items-center gap-1">
                              <span>🥑</span>
                              {item.nutritionalInfo.fat}g fat
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (item.customizationOptions && item.customizationOptions.length > 0) {
                        setCustomizingItem(item);
                      } else {
                        handleAddToCart(item);
                      }
                    }}
                    disabled={!item.isAvailable}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    {item.customizationOptions && item.customizationOptions.length > 0 ? (
                      <>
                        <span>⚙️</span>
                        Customize & Add
                      </>
                    ) : (
                      <>
                        <span>➕</span>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Customer Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Customer Reviews
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            See what others are saying about this restaurant
          </p>
        </div>

        {user && currentOrder ? (
          <RestaurantFeedback
            restaurantId={id}
            orderId={currentOrder._id}
            isOwner={isOwner}
          />
        ) : (
          <div className="space-y-6">
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {isOwner ? "👨‍🍳" : "📝"}
                  </div>
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    {isOwner ? "You are viewing this page as the owner." : "Order from this restaurant to leave your first review!"}
                  </p>
                </div>
             </div>
             <RestaurantFeedback restaurantId={id} isOwner={isOwner} />
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⚙️</span>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Customize {customizingItem.name}
              </h3>
            </div>

            <div className="space-y-6">
              {customizingItem.customizationOptions.map((option, index) => (
                <div key={index} className="space-y-2">
                  <label className="block font-semibold text-gray-900 dark:text-white text-lg">
                    {option.name}
                  </label>
                  {option.type === 'boolean' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizations[option.name] || false}
                        onChange={(e) => setCustomizations(prev => ({
                          ...prev,
                          [option.name]: e.target.checked
                        }))}
                        className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Add {option.name}</span>
                    </label>
                  )}
                  {option.type === 'select' && (
                    <select
                      value={customizations[option.name] || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [option.name]: e.target.value
                      }))}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300"
                    >
                      <option value="">Select {option.name}</option>
                      {option.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {option.type === 'text' && (
                    <input
                      type="text"
                      value={customizations[option.name] || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [option.name]: e.target.value
                      }))}
                      placeholder={`Enter ${option.name}`}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300"
                    />
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <label className="block font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  <span>📝</span>
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  className="w-full border-2 border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-300 resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  const customizationsArray = Object.entries(customizations)
                    .filter(([_, value]) => value !== '' && value !== false)
                    .map(([name, value]) => ({
                      name,
                      value: String(value),
                      price: 0
                    }));

             handleAddToCart({
  _id: customizingItem._id,
  name: customizingItem.name,
  price: customizingItem.price,
  customizations: customizationsArray,
  specialInstructions
});
                  setCustomizingItem(null);
                  setCustomizations({});
                  setSpecialInstructions('');
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>✅</span>
                Add to Cart
              </button>
              <button
                onClick={() => {
                  setCustomizingItem(null);
                  setCustomizations({});
                  setSpecialInstructions('');
                }}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>❌</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}