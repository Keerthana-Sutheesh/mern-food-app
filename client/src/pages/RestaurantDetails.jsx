import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById, addToFavorites, removeFromFavorites, checkFavoriteStatus } from "../api/restaurant";
import { CartContext } from "../context/cart";
import { useAuth } from "../context/auth";
import RestaurantFeedback from "../components/RestaurantFeedback";

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [menuItemFavorites, setMenuItemFavorites] = useState(new Set());
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customizations, setCustomizations] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const { addToCart } = useContext(CartContext);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const res = await getRestaurantById(id);
        setRestaurant(res.data.restaurant);
        setMenu(res.data.menu);

        // Check if restaurant is favorited and if user is owner
        if (user) {
          const favRes = await checkFavoriteStatus("restaurant", id);
          setIsFavorited(favRes.data.isFavorited);
          setIsOwner(res.data.restaurant.owner.toString() === user.id);

          // Check favorite status for menu items
          const menuItemFavoritesSet = new Set();
          for (const item of res.data.menu) {
            try {
              const itemFavRes = await checkFavoriteStatus("menuItem", item._id);
              if (itemFavRes.data.isFavorited) {
                menuItemFavoritesSet.add(item._id);
              }
            } catch (error) {
              // Ignore errors for individual favorite checks
            }
          }
          setMenuItemFavorites(menuItemFavoritesSet);
        }
      } catch (err) {
        setError("Failed to load restaurant details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, user]);

  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      restaurant: restaurant._id,
      restaurantName: restaurant.name
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
      console.error("Error toggling favorite:", error);
    }
  };

  const handleToggleMenuItemFavorite = async (menuItemId) => {
    if (!user) return;

    try {
      const isFavorited = menuItemFavorites.has(menuItemId);
      if (isFavorited) {
        await removeFromFavorites("menuItem", menuItemId);
        setMenuItemFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(menuItemId);
          return newFavorites;
        });
      } else {
        await addToFavorites({ type: "menuItem", itemId: menuItemId });
        setMenuItemFavorites(prev => new Set([...prev, menuItemId]));
      }
    } catch (error) {
      console.error("Error toggling menu item favorite:", error);
    }
  };

  const handleCustomizeItem = (item) => {
    setCustomizingItem(item);
    setCustomizations({});
    setSpecialInstructions("");
  };

  const handleCustomizationChange = (optionName, value) => {
    setCustomizations(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleAddCustomizedToCart = () => {
    const customizedItem = {
      ...customizingItem,
      customizations,
      specialInstructions,
      restaurant: restaurant._id,
      restaurantName: restaurant.name
    };
    addToCart(customizedItem);
    setCustomizingItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }


  const menuByCategory = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                {user && (
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full transition ${
                      isFavorited
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorited ? '❤️' : '🤍'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-2">{restaurant.cuisine} • {restaurant.address}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span>⭐ {restaurant.rating?.toFixed(1) || 'New'}</span>
                <span>🕒 {restaurant.deliveryTime}</span>
                <span>₹{restaurant.deliveryFee} delivery</span>
                <span>{restaurant.priceRange}</span>
              </div>
              {restaurant.description && (
                <p className="text-gray-700 mt-2">{restaurant.description}</p>
              )}
              {restaurant.services && restaurant.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {restaurant.services.map((service, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/cart"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

        {Object.keys(menuByCategory).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items available yet.</p>
          </div>
        ) : (
          Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                {category.replace('_', ' ')}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      )}

           
                      {item.nutritionalInfo && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                          <div className="grid grid-cols-2 gap-1 text-gray-600">
                            {item.nutritionalInfo.calories > 0 && (
                              <span>{item.nutritionalInfo.calories} cal</span>
                            )}
                            {item.nutritionalInfo.protein > 0 && (
                              <span>{item.nutritionalInfo.protein}g protein</span>
                            )}
                            {item.nutritionalInfo.carbs > 0 && (
                              <span>{item.nutritionalInfo.carbs}g carbs</span>
                            )}
                            {item.nutritionalInfo.fat > 0 && (
                              <span>{item.nutritionalInfo.fat}g fat</span>
                            )}
                            {item.nutritionalInfo.fiber > 0 && (
                              <span>{item.nutritionalInfo.fiber}g fiber</span>
                            )}
                          </div>
                        </div>
                      )}

        
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen, index) => (
                              <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                ⚠️ {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {item.isVegetarian && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Vegetarian
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                            Vegan
                          </span>
                        )}
                        {item.spicyLevel && item.spicyLevel !== 'mild' && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded capitalize">
                            {item.spicyLevel}
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">
                          🕒 {item.preparationTime}min
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.isAvailable}
                          className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        {item.customizationOptions && item.customizationOptions.length > 0 && (
                          <button
                            onClick={() => handleCustomizeItem(item)}
                            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition text-sm"
                            title="Customize"
                          >
                            ⚙️
                          </button>
                        )}
                        {user && (
                          <button
                            onClick={() => handleToggleMenuItemFavorite(item._id)}
                            className={`p-2 rounded-lg transition text-sm ${
                              menuItemFavorites.has(item._id)
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={menuItemFavorites.has(item._id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {menuItemFavorites.has(item._id) ? '❤️' : '🤍'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    
      <div className="max-w-6xl mx-auto px-4 py-8">
        <RestaurantFeedback
          restaurantId={id}
          isOwner={isOwner}
        />
      </div>


      {customizingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Customize {customizingItem.name}</h3>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {customizingItem.customizationOptions?.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {option.name} {option.price > 0 && `(+₹${option.price})`}
                    </label>

                    {option.type === 'boolean' && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customizations[option.name] || false}
                          onChange={(e) => handleCustomizationChange(option.name, e.target.checked)}
                          className="mr-2"
                        />
                        Add {option.name}
                      </label>
                    )}

                    {option.type === 'select' && (
                      <select
                        value={customizations[option.name] || ''}
                        onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select {option.name}</option>
                        {option.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {option.type === 'text' && (
                      <input
                        type="text"
                        placeholder={`Enter ${option.name.toLowerCase()}`}
                        value={customizations[option.name] || ''}
                        onChange={(e) => handleCustomizationChange(option.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or modifications..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomizedToCart}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
