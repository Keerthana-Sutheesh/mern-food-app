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
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          🍔 FoodApp
        </h1>

        <div className="flex items-center gap-6">

          
          {user.role === "user" && (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 hover:bg-orange-600 rounded-lg"
              >
                🛒
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="hover:underline text-sm text-orange-500"
              >
                My Orders
              </button>
            </>
          )}

        
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
                className="hover:underline text-sm text-orange-500"
              >
                My Restaurant
              </button>
              <button
                onClick={() => navigate("/owner/create-restaurant")}
                className="hover:underline text-sm text-orange-500"
              >
                Create Restaurant
              </button>
            </>
          )}

        
          <div className="relative group">
            <button className="hover:underline text-sm text-orange-500">
              Account ▼
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => navigate("/profile")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                👤 Profile
              </button>

              {user.role === "user" && (
                <>
                  <button
                    onClick={() => navigate("/favorites")}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    ❤️ Favorites
                  </button>
                  <button
                    onClick={() => navigate("/order-history")}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    📋 Order History
                  </button>
                </>
              )}

              <div className="border-t my-1" />

              <button
                onClick={() => navigate("/payments/history")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                💳 Payment History
              </button>
            </div>
          </div>

       
          <span className="text-sm hidden sm:block">
            Hi, <b>{user.name}</b>
          </span>

        
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-white text-orange-500 px-4 py-1.5 rounded-md font-medium hover:bg-orange-100"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
