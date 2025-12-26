import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotAuthorized from "../pages/NotAuthorized";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import OwnerRoute from "./OwnerRoute";
import CreateRestaurant from "../pages/CreateRestaurant";
import RestaurantDetails from "../pages/RestaurantDetails";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import OrderTracking from "../pages/OrderTracking";
import PaymentHistory from "../pages/PaymentHistory";
import SavedPaymentMethods from "../pages/SavedPaymentMethods";
import Profile from "../pages/Profile";
import OrderHistory from "../pages/OrderHistory";
import OrderDetails from "../pages/OrderDetails";
import Favorites from "../pages/Favorites";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

    
      <Route
        path="/restaurant/:id"
        element={
          <ProtectedRoute>
            <RestaurantDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderTracking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments/history"
        element={
          <ProtectedRoute>
            <PaymentHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments/saved-methods"
        element={
          <ProtectedRoute>
            <SavedPaymentMethods />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order-history"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/details/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/create-restaurant"
        element={
          <OwnerRoute>
            <CreateRestaurant />
          </OwnerRoute>
        }
      />
      <Route path="/not-authorized" element={<NotAuthorized />} />
    </Routes>
  );
}
