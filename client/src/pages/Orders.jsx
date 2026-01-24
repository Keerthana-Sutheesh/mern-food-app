import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, getUserNotifications } from "../api/order";
import { useAuth } from "../context/auth";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const [ordersRes, notificationsRes] = await Promise.all([
          getOrders(),
          getUserNotifications()
        ]);

        setOrders(ordersRes.data);
        setNotifications(notificationsRes.data.notifications);
      } catch (err) {
        setError("Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrdersData();
    }
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.orderStatus === filter;
  });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 My Orders</h1>
          {unreadNotifications > 0 && (
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              🔔 {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-4 mb-6">
          <div className="flex space-x-4 flex-wrap">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'placed', label: 'Placed' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'out_for_delivery', label: 'Out for Delivery' },
              { value: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === tab.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300 font-medium">❌ {error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No orders found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
              {filter === 'all'
                ? "You haven't placed any orders yet."
                : `You don't have any ${filter.replace('_', ' ')} orders.`
              }
            </p>
            <Link
              to="/"
              className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition font-semibold inline-block"
            >
              🍔 Start Ordering
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-lg font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                    >
                      Order #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 font-medium">
                      📅 {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">📋 Items</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">🚚 Delivery</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
                    </p>
                    {order.estimatedDeliveryTime && order.orderStatus !== 'delivered' && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-semibold">
                        ⏱️ Est. delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white">Total: ₹{order.totalAmount}</span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
                  >
                    🔍 Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

    
        {notifications.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔔 Recent Notifications</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={`${notification.orderId}-${notification.timestamp}`}
                  className={`p-3 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                      : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <p className={`font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-blue-900 dark:text-blue-300'}`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Order #{notification.orderId.slice(-8).toUpperCase()} • {' '}
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {notifications.length > 5 && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-4 font-medium">
                And {notifications.length - 5} more notifications...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}