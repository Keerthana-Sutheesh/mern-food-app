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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          {unreadNotifications > 0 && (
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
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
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === tab.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet."
                : `You don't have any ${filter.replace('_', ' ')} orders.`
              }
            </p>
            <Link
              to="/"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-lg font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Order #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery</h4>
                    <p className="text-sm text-gray-600">
                      {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
                    </p>
                    {order.estimatedDeliveryTime && order.orderStatus !== 'delivered' && (
                      <p className="text-sm text-orange-600 mt-1">
                        Est. delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total: ₹{order.totalAmount}</span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

    
        {notifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={`${notification.orderId}-${notification.timestamp}`}
                  className={`p-3 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <p className={notification.read ? 'text-gray-700' : 'text-blue-900 font-medium'}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{notification.orderId.slice(-8).toUpperCase()} • {' '}
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {notifications.length > 5 && (
              <p className="text-center text-gray-500 mt-4">
                And {notifications.length - 5} more notifications...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}