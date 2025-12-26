import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/cart";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);

  if (!user) return null;

  return (
    <nav className="w-full bg-orange-500 text-white shadow-md">
      <div className="w-full px-6 py-4 flex justify-between items-center">
        
      
        <h1
          className="text-xl font-bold cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          🍔 FoodApp
        </h1>

   
        <div className="flex items-center gap-6">

       
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 hover:bg-orange-100 rounded-lg transition"
            title="View Cart"
          >
            🛒
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>

        
          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="hover:underline text-sm text-orange-500"
            >
              Admin Dashboard
            </button>
          )}

          {user.role === "owner" && (
            <>
              <button
                onClick={() => navigate("/owner")}
                className="hover:underline text-sm  text-orange-500"
              >
                My Restaurant
              </button>
              <button
                onClick={() => navigate("/owner/create-restaurant")}
                className="hover:underline text-sm  text-orange-500"
              >
                Create Restaurant
              </button>
            </>
          )}

       
          <button
            onClick={() => navigate("/orders")}
            className="hover:underline text-sm  text-orange-500"
          >
            My Orders
          </button>

        
          <div className="relative group">
            <button className="hover:underline text-sm flex items-center gap-1  text-orange-500">
              Account ▼
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <button
                  onClick={() => navigate("/favorites")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ❤️ My Favorites
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  👤 Profile Settings
                </button>
                <button
                  onClick={() => navigate("/order-history")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📋 Order History
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => navigate("/payments/history")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  💳 Payment History
                </button>
                <button
                  onClick={() => navigate("/payments/saved-methods")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  💾 Saved Methods
                </button>
              </div>
            </div>
          </div>

         
          <span className="text-sm hidden sm:block">
            Hi, <span className="font-semibold">{user.name}</span>
          </span>

        
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-white text-orange-500 px-4 py-1.5 rounded-md font-medium hover:bg-orange-100 transition"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
