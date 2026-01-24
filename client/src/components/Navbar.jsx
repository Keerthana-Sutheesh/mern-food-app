import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/cart";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="sticky top-0 w-full bg-orange-500 dark:bg-orange-600 text-white shadow-lg dark:shadow-xl transition-all duration-300 z-50">
      <div className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1
          className="text-3xl sm:text-4xl font-black cursor-pointer hover:scale-110 transition-transform tracking-wide text-white drop-shadow-lg"
          onClick={() => navigate("/")}
        >
          🍔 FoodApp
        </h1>

        <div className="flex items-center gap-3 sm:gap-6">
          {user.role === "user" && (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="relative p-3 hover:bg-orange-600 dark:hover:bg-orange-700 rounded-full transition-all transform hover:scale-110 text-2xl"
                title="Shopping Cart"
              >
                🛒
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="hover:bg-orange-600 dark:hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
              >
                My Orders
              </button>
            </>
          )}

          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="hover:bg-orange-600 dark:hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
            >
              Admin Dashboard
            </button>
          )}

          {user.role === "owner" && (
            <>
              <button
                onClick={() => navigate("/owner")}
                className="hover:bg-orange-600 dark:hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
              >
                My Restaurant
              </button>
              <button
                onClick={() => navigate("/owner/create-restaurant")}
                className="hover:bg-orange-600 dark:hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
              >
                Create Restaurant
              </button>
            </>
          )}

       
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-sm sm:text-base font-bold truncate text-white drop-shadow hover:bg-orange-600 dark:hover:bg-orange-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              👤 {user.name}
              <span className={`text-lg transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  👤 Profile
                </button>

                {user.role === "user" && (
                  <>
                    <button
                      onClick={() => {
                        navigate("/favorites");
                        setDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      ❤️ Favorites
                    </button>
                    <button
                      onClick={() => {
                        navigate("/order-history");
                        setDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      📋 Order History
                    </button>
                    <button
                      onClick={() => {
                        navigate("/payments/history");
                        setDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      💳 Payment History
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="block w-full px-4 py-2 text-left text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t dark:border-gray-700 text-red-600 dark:text-red-400"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
