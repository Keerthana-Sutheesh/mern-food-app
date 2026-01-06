import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/cart";
import { useAuth } from "../context/auth";

import { useCartTotals } from "../hooks/useCartTotals";
import { useSavedPayments } from "../hooks/useSavedPayments";
import { useDeliverySlots } from "../hooks/useDeliverySlots";
import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import { useOrderPlacement } from "../hooks/useOrderPlacement";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();


  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine: "",
    city: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const [deliveryType, setDeliveryType] = useState("instant");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  
  const { subtotal, deliveryFee, grandTotal } = useCartTotals(cartItems);
  const savedPaymentMethods = useSavedPayments(user, showCheckout);
  const { slots: availableSlots, loading: isLoadingSlots } =
    useDeliverySlots(scheduledDate, deliveryType);

  const payOnline = useRazorpayPayment({
    user,
    clearCart,
    navigate
  });

  const placeOrder = useOrderPlacement({
    cartItems,
    clearCart,
    navigate,
    payOnline
  });

 
  const handlePlaceOrder = async () => {
    if (!user) return navigate("/login");
    if (!cartItems.length) return;

    if (!deliveryAddress.addressLine || !deliveryAddress.city) {
      alert("Please enter delivery address");
      return;
    }

    if (deliveryType === "scheduled" && (!scheduledDate || !timeSlot)) {
      alert("Please select delivery date and time slot");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await placeOrder({
        user,
        paymentMethod,
        deliveryAddress,
        deliveryType,
        scheduledDate,
        timeSlot,
        deliveryNotes,
        savePaymentMethod
      });
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };


  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

       
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div
              key={item.cartId || item._id}
              className="bg-white p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gray-600">₹{item.price}</p>
                  
                  {/* Display customizations */}
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Customizations:</p>
                      <ul className="list-disc list-inside ml-2">
                        {item.customizations.map((cust, idx) => (
                          <li key={idx}>
                            {cust.name}: {cust.value}
                            {cust.price > 0 && ` (+₹${cust.price})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  
                  {item.specialInstructions && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">Special Instructions:</p>
                      <p className="italic">{item.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.cartId || item._id, item.quantity - 1)
                    }
                    className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.cartId || item._id, item.quantity + 1)
                    }
                    className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"
                  >
                    +
                  </button>

                  <span className="font-semibold w-16 text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.cartId || item._id)}
                    className="text-red-500 ml-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

    
        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>

          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg"
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="mt-4 space-y-4">
           
              <input
                type="text"
                placeholder="Address"
                value={deliveryAddress.addressLine}
                onChange={(e) =>
                  setDeliveryAddress({
                    ...deliveryAddress,
                    addressLine: e.target.value
                  })
                }
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="City"
                value={deliveryAddress.city}
                onChange={(e) =>
                  setDeliveryAddress({
                    ...deliveryAddress,
                    city: e.target.value
                  })
                }
                className="w-full border p-2 rounded"
              />

              <h3 className="font-medium">Payment Method</h3>
              <label>
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />{" "}
                Cash on Delivery
              </label>

              <label>
                <input
                  type="radio"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />{" "}
                Online Payment
              </label>

              {paymentMethod === "ONLINE" && (
                <label className="block">
                  <input
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  />{" "}
                  Save payment method
                </label>
              )}

              <h3 className="font-medium">Delivery Type</h3>
              <label>
                <input
                  type="radio"
                  value="instant"
                  checked={deliveryType === "instant"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />{" "}
                Instant Delivery
              </label>

              <label>
                <input
                  type="radio"
                  value="scheduled"
                  checked={deliveryType === "scheduled"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />{" "}
                Scheduled Delivery
              </label>

              {deliveryType === "scheduled" && (
                <>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full border p-2 rounded"
                  />

                  {isLoadingSlots ? (
                    <p>Loading slots...</p>
                  ) : (
                    availableSlots.map(({ slot, available }) => (
                      <label key={slot} className="block">
                        <input
                          type="radio"
                          value={slot}
                          disabled={!available}
                          checked={timeSlot === slot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                        />{" "}
                        {slot} {!available && "(Full)"}
                      </label>
                    ))
                  )}
                </>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-orange-500 text-white py-2 rounded-lg"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
