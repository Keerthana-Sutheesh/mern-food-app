import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/cart";
import { useAuth } from "../context/auth";

import { useCartTotals } from "../hooks/useCartTotals";
import { useSavedPayments } from "../hooks/useSavedPayments";
import { useDeliverySlots } from "../hooks/useDeliverySlots";
import { useRazorpayPayment } from "../hooks/useRazorpayPayment";
import { useOrderPlacement } from "../hooks/useOrderPlacement";
import useAddressManagement from "../hooks/useAddressManagement";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address Management Hook
  const { addresses, getDefaultAddress, addAddress, loading: addressLoading } = useAddressManagement();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine: "",
    city: ""
  });

  // Initialize with default address
  useEffect(() => {
    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress._id);
      setDeliveryAddress({
        addressLine: defaultAddress.street,
        city: defaultAddress.city
      });
    }
  }, [addresses]);

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

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.state || !newAddressForm.zipCode) {
      alert('Please fill all address fields');
      return;
    }

    try {
      await addAddress(newAddressForm);
      setNewAddressForm({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
      });
      setShowAddForm(false);
      alert('Address added successfully!');
    } catch (error) {
      alert('Failed to add address: ' + (error.message || 'Unknown error'));
    }
  };
 
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-300">
        <div className="text-center">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some delicious food to get started!</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            🍕 Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">🛒 Your Cart</h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div
              key={item.cartId || item._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</h4>
                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">₹{item.price}</p>
                  
                  {/* Display customizations */}
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Customizations:</p>
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
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Special Instructions:</p>
                      <p className="italic">{item.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      updateQuantity(item.cartId || item._id, item.quantity - 1)
                    }
                    className="w-9 h-9 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg flex items-center justify-center font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.cartId || item._id, item.quantity + 1)
                    }
                    className="w-9 h-9 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg flex items-center justify-center font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>

                  <span className="font-bold text-gray-900 dark:text-white w-20 text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.cartId || item._id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors text-xl"
                    title="Remove from cart"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 shadow-md">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
              <span className="font-medium">Delivery Fee</span>
              <span className="font-semibold">₹{deliveryFee}</span>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-3 flex justify-between items-center text-lg">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">₹{grandTotal}</span>
            </div>
          </div>

          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg"
            >
              💳 Proceed to Checkout
            </button>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📍 Delivery Address</h3>
                
                {addresses.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label
                          key={addr._id}
                          className="flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all bg-white dark:bg-gray-800"
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr._id}
                            checked={selectedAddressId === addr._id}
                            onChange={() => {
                              setSelectedAddressId(addr._id);
                              setDeliveryAddress({
                                addressLine: addr.street,
                                city: addr.city
                              });
                            }}
                            className="mt-1 w-4 h-4 accent-blue-600"
                          />
                          <div className="ml-4 flex-grow">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {addr.label === 'Home' && '🏠 '}
                              {addr.label === 'Office' && '🏢 '}
                              {addr.label === 'Other' && '📍 '}
                              {addr.label}
                              {addr.isDefault && (
                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-semibold">
                                  ⭐ Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              📍 {addr.street}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowAddForm(true)}
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm hover:underline font-semibold transition-colors"
                    >
                      + Add New Address
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No saved addresses. Please add one below.</p>
                )}

                {/* Add New Address Form */}
                {showAddForm ? (
                  <form onSubmit={handleAddNewAddress} className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">➕ Add New Address</h4>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Address Type</label>
                      <select
                        value={newAddressForm.label}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            label: e.target.value
                          })
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      >
                        <option value="Home">🏠 Home</option>
                        <option value="Office">🏢 Office</option>
                        <option value="Other">📍 Other</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Street Address *</label>
                      <input
                        type="text"
                        placeholder="Enter street address"
                        value={newAddressForm.street}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            street: e.target.value
                          })
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">City *</label>
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddressForm.city}
                          onChange={(e) =>
                            setNewAddressForm({
                              ...newAddressForm,
                              city: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">State *</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddressForm.state}
                          onChange={(e) =>
                            setNewAddressForm({
                              ...newAddressForm,
                              state: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Zip Code *</label>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={newAddressForm.zipCode}
                        onChange={(e) =>
                          setNewAddressForm({
                            ...newAddressForm,
                            zipCode: e.target.value
                          })
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                        <input
                          type="checkbox"
                          checked={newAddressForm.isDefault}
                          onChange={(e) =>
                            setNewAddressForm({
                              ...newAddressForm,
                              isDefault: e.target.checked
                            })
                          }
                          className="mr-2 accent-blue-600"
                        />
                        Set as default address
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="flex-1 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {addressLoading ? '⏳ Saving...' : '✅ Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg font-semibold transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3 font-medium">⚠️ No saved addresses. Please add an address to continue.</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      type="button"
                      className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Add Address Now
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Payment Method Section */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💳 Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white font-medium">💵 Cash on Delivery (COD)</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white font-medium">🔒 Online Payment</span>
                  </label>
                </div>

                {paymentMethod === "ONLINE" && (
                  <label className="flex items-center mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={savePaymentMethod}
                      onChange={(e) => setSavePaymentMethod(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white font-medium">💾 Save payment method for future</span>
                  </label>
                )}
              </div>

              {/* Delivery Type Section */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🚚 Delivery Type</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      value="instant"
                      checked={deliveryType === "instant"}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white font-medium">⚡ Instant Delivery</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={deliveryType === "scheduled"}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="ml-3 text-gray-900 dark:text-white font-medium">📅 Scheduled Delivery</span>
                  </label>
                </div>

                {deliveryType === "scheduled" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 Select Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⏰ Select Time Slot</label>
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-4 text-gray-600 dark:text-gray-400">
                          <span className="animate-spin mr-2">⏳</span>
                          Loading available slots...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableSlots.map(({ slot, available }) => (
                            <label
                              key={slot}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                timeSlot === slot
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 dark:hover:border-blue-600'}`}
                            >
                              <input
                                type="radio"
                                value={slot}
                                disabled={!available}
                                checked={timeSlot === slot}
                                onChange={(e) => setTimeSlot(e.target.value)}
                                className="accent-blue-600"
                              />
                              <span className={`ml-2 font-medium ${!available ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                {slot} {!available && '(Full)'}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 py-4">No available slots for this date</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
