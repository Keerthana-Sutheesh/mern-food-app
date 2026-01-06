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
      if (!user || !id || isOwner) return;
      try {
        const res = await api.get(`/orders/current/${id}`);
        setCurrentOrder(res.data);
      } catch (err) {
        console.log("No order found for this user.");
        setCurrentOrder(null);
      }
    };
    fetchOrder();
  }, [id, user, isOwner]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !restaurant) return <div className="text-center p-20">{error || "Restaurant not found"}</div>;

  const menuByCategory = menu.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
    
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{restaurant.name}</h1>
              {user && (
                <button onClick={handleToggleFavorite} className="text-2xl">
                  {isFavorited ? '❤️' : '🤍'}
                </button>
              )}
            </div>
            <p className="text-gray-600 mt-2">{restaurant.cuisine} • {restaurant.address}</p>
          </div>
          <Link to="/cart" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold">View Cart</Link>
        </div>
      </div>


      <div className="max-w-6xl mx-auto px-4 py-8">
        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h3 className="text-2xl font-bold mb-6 capitalize border-l-4 border-orange-500 pl-4">{category}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{item.name}</h4>
                        {user && (
                          <button 
                            onClick={() => handleToggleMenuItemFavorite(item._id)}
                            className="text-lg mt-1"
                          >
                            {menuItemFavorites.has(item._id) ? '❤️' : '🤍'}
                          </button>
                        )}
                      </div>
                      <span className="text-orange-600 font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{item.description}</p>

                 
                    {item.nutritionalInfo && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
                        <p className="font-bold text-gray-400 mb-2 uppercase tracking-tighter">Nutritional Value</p>
                        <div className="grid grid-cols-2 gap-2">
                          {item.nutritionalInfo.calories && <span>🔥 {item.nutritionalInfo.calories} cal</span>}
                          {item.nutritionalInfo.protein && <span>💪 {item.nutritionalInfo.protein}g protein</span>}
                          {item.nutritionalInfo.carbs && <span>🍞 {item.nutritionalInfo.carbs}g carbs</span>}
                          {item.nutritionalInfo.fat && <span>🥑 {item.nutritionalInfo.fat}g fat</span>}
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
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300"
                  >
                    {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

     
      <div className="max-w-6xl mx-auto px-4 py-12 border-t">
        <h3 className="text-2xl font-bold mb-8">Customer Reviews</h3>
        
        {user && currentOrder ? (
          <RestaurantFeedback
            restaurantId={id}
            orderId={currentOrder._id}
            isOwner={isOwner}
          />
        ) : (
          <div className="space-y-6">
             <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-center">
                {isOwner ? "You are viewing this page as the owner." : "Order from this restaurant to leave your first review!"}
             </div>
             <RestaurantFeedback restaurantId={id} isOwner={isOwner} />
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Customize {customizingItem.name}</h3>
            
            <div className="space-y-4">
              {customizingItem.customizationOptions.map((option, index) => (
                <div key={index}>
                  <label className="block font-medium mb-2">{option.name}</label>
                  {option.type === 'boolean' && (
                    <input
                      type="checkbox"
                      checked={customizations[option.name] || false}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [option.name]: e.target.checked
                      }))}
                      className="mr-2"
                    />
                  )}
                  {option.type === 'select' && (
                    <select
                      value={customizations[option.name] || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [option.name]: e.target.value
                      }))}
                      className="w-full border p-2 rounded"
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
                      className="w-full border p-2 rounded"
                    />
                  )}
                </div>
              ))}
              
              <div>
                <label className="block font-medium mb-2">Special Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full border p-2 rounded"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  handleAddToCart({
                    ...customizingItem,
                    customizations,
                    specialInstructions
                  });
                  setCustomizingItem(null);
                  setCustomizations({});
                  setSpecialInstructions('');
                }}
                className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  setCustomizingItem(null);
                  setCustomizations({});
                  setSpecialInstructions('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}