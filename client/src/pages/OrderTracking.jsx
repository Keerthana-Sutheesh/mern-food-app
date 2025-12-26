import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, getOrderNotifications, markNotificationAsRead } from "../api/order";
import { getOrderFeedback } from "../api/feedback";
import FeedbackForm from "../components/FeedbackForm";
import { useAuth } from "../context/auth";

export default function OrderTracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const [orderRes, notificationsRes] = await Promise.all([
          getOrderById(id),
          getOrderNotifications(id)
        ]);

        setOrder(orderRes.data);
        setNotifications(notificationsRes.data.notifications);

     
        if (orderRes.data.orderStatus === 'delivered') {
          try {
            const feedbackRes = await getOrderFeedback(id);
            setFeedback(feedbackRes.data);
          } catch (feedbackErr) {
         
            console.log('No feedback submitted yet');
          }
        }
      } catch (err) {
        setError("Failed to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrderData();
    }
  }, [id, user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(id, notificationId);
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

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

  const getStatusStep = (status) => {
    const steps = {
      placed: 1,
      accepted: 2,
      preparing: 3,
      out_for_delivery: 4,
      delivered: 5
    };
    return steps[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
          <Link
            to="/orders"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/orders"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>

    
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {[
                { status: 'placed', label: 'Order Placed', icon: '📝' },
                { status: 'accepted', label: 'Accepted', icon: '✅' },
                { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
                { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴‍♂️' },
                { status: 'delivered', label: 'Delivered', icon: '📦' }
              ].map((step, index) => (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                    index + 1 <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-sm text-center ${
                    index + 1 <= currentStep ? 'text-orange-600 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

     
          {order.estimatedDeliveryTime && order.orderStatus !== 'delivered' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">🚚</div>
                <div>
                  <h4 className="font-medium text-blue-900">Estimated Delivery</h4>
                  <p className="text-blue-700">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

     
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.customizations.map((custom, idx) => (
                          <span key={idx} className="mr-2">
                            {custom.name}: {custom.value}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

     
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Address</h3>
            <p className="text-gray-600">
              {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
            </p>
          </div>

   
          <div className="flex justify-between text-sm text-gray-600">
            <span>Payment Method: {order.paymentMethod}</span>
            <span>Status: {order.paymentStatus}</span>
          </div>
        </div>

      
        {order.orderStatus === 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Feedback</h3>

            {feedback ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Your Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${star <= feedback.overallRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({feedback.overallRating}/5)</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {feedback.overallComment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{feedback.overallComment}</p>
                  </div>
                )}

                <div className="text-sm text-green-600 font-medium">
                  ✅ Thank you for your feedback! It helps us improve our service.
                </div>
              </div>
            ) : showFeedbackForm ? (
              <FeedbackForm
                orderId={id}
                onSuccess={() => {
                  setShowFeedbackForm(false);
                 
                  window.location.reload();
                }}
                onCancel={() => setShowFeedbackForm(false)}
              />
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  How was your experience?
                </h4>
                <p className="text-gray-600 mb-4">
                  Your feedback helps us improve our service and helps other customers make better decisions.
                </p>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        )}

    
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={notification.read ? 'text-gray-700' : 'text-blue-900 font-medium'}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}