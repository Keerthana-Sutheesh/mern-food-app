import React from "react";
import { useParams, Link } from "react-router-dom";
import {useOrderDetails} from "../hooks/useOrderDetails";
import {useOrderStatus} from "../hooks/useOrderStatus";


const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const OrderDetails = () => {
  const { orderId } = useParams();

  const { order, deliverySchedule, feedback, loading } =
    useOrderDetails(orderId);

  const { statusColor, progressSteps } =
    useOrderStatus(order?.orderStatus);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-semibold">Order not found</p>
        <Link to="/orders" className="text-blue-600 mt-2">
          Back to orders
        </Link>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/orders" className="text-blue-600">
          ← Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow mt-4 overflow-hidden">
       
          <div className="flex justify-between px-6 py-4 bg-gray-800 text-white">
            <div>
              <h1 className="text-xl font-bold">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-300">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {order.orderStatus.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="p-6 space-y-6">
    
            {!["cancelled", "delivered"].includes(
              order.orderStatus
            ) && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-4">
                  Order Progress
                </h3>
                <div className="flex justify-between">
                  {progressSteps.map((step) => (
                    <div
                      key={step.key}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-100 text-green-600"
                            : step.current
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-xs mt-2 text-center">
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

      
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-3">Order Items</h3>

              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="py-3 border-b last:border-none"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.menuItem?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      
                  
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium text-gray-800">Customizations:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {item.customizations.map((cust, idx) => (
                              <li key={idx}>
                                {cust.name}: {cust.value}
                                {cust.price > 0 && ` (+${formatCurrency(cust.price)})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                    
                      {item.specialInstructions && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium text-gray-800">Special Instructions:</p>
                          <p className="italic mt-1">{item.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <p className="font-medium ml-4">
                      {formatCurrency(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

        
            {feedback && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">
                  Your Feedback
                </h3>
                <p className="text-sm">
                  Rating: {feedback.rating}/5
                </p>
                {feedback.comment && (
                  <p className="mt-1">{feedback.comment}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on{" "}
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
