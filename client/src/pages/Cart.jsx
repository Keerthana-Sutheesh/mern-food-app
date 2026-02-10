import React, { useContext, useEffect, useState } from "react";
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
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    addresses,
    getDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    loading: addressLoading
  } = useAddressManagement();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddressForm, setNewAddressForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState({});

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const [deliveryType, setDeliveryType] = useState("instant");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const normalizeAddress = (data) => ({
    ...data,
    label: (data.label || "").trim(),
    street: (data.street || "").trim(),
    city: (data.city || "").trim(),
    state: (data.state || "").trim(),
    zipCode: (data.zipCode || "").trim(),
    country: (data.country || "").trim()
  });

  const validateAddress = (data) => {
    const errors = {};
    const allowedLabels = ["Home", "Office", "Other"];

    if (!data.label || !allowedLabels.includes(data.label)) {
      errors.label = "Please select a valid label";
    }
    if (!data.street) {
      errors.street = "Street is required";
    } else if (data.street.length < 5) {
      errors.street = "Street must be at least 5 characters";
    }
    if (!data.city) {
      errors.city = "City is required";
    } else if (data.city.length < 2) {
      errors.city = "City must be at least 2 characters";
    }
    if (!data.state) {
      errors.state = "State is required";
    } else if (data.state.length < 2) {
      errors.state = "State must be at least 2 characters";
    }
    if (!data.zipCode) {
      errors.zipCode = "ZIP code is required";
    } else if (!/^\d{5,6}$/.test(data.zipCode)) {
      errors.zipCode = "ZIP code must be 5-6 digits";
    }
    if (!data.country) {
      errors.country = "Country is required";
    } else if (data.country.length < 2) {
      errors.country = "Country must be at least 2 characters";
    }
    return errors;
  };

  const handleAddressFieldChange = (field, value) => {
    setNewAddressForm((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleEditAddress = (address) => {
    setNewAddressForm(address);
    setEditingAddressId(address._id);
    setShowAddForm(true);
  };

  const handleAddAddress = async () => {
    const normalized = normalizeAddress(newAddressForm);
    const errors = validateAddress(normalized);
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, normalized);
      } else {
        await addAddress(normalized);
      }
      setNewAddressForm({ label: "Home", street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
      setAddressErrors({});
      setEditingAddressId(null);
      setShowAddForm(false);
    } catch (err) {
      setOrderError(err.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      if (selectedAddressId === addressId) {
        setSelectedAddressId("");
      }
      await deleteAddress(addressId);
    } catch (err) {
      setOrderError(err.message || "Failed to delete address");
    }
  };

  useEffect(() => {
    const def = getDefaultAddress();
    if (def) setSelectedAddressId(def._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const { subtotal, deliveryFee, grandTotal } = useCartTotals(cartItems);
  useSavedPayments(user, showCheckout);
  const { slots: availableSlots = [], loading: isLoadingSlots = false } = useDeliverySlots(scheduledDate, deliveryType) || {};

  const payOnline = useRazorpayPayment({ user, clearCart, navigate });
  const placeOrder = useOrderPlacement({ cartItems, clearCart, navigate, payOnline });

  const handlePlaceOrder = async () => {
    if (!user) return navigate("/login");
    if (!cartItems.length) return;
    if (!selectedAddressId && !newAddressForm.street) {
      setOrderError("Please select or add a delivery address");
      return;
    }

    setOrderError("");
    setIsPlacingOrder(true);
    try {
      const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
      const deliveryAddr = selectedAddr || {
        street: newAddressForm.street,
        city: newAddressForm.city,
        state: newAddressForm.state,
        zipCode: newAddressForm.zipCode,
        country: newAddressForm.country
      };

      await placeOrder({
        user,
        paymentMethod,
        deliveryAddress: deliveryAddr,
        deliveryType,
        scheduledDate,
        timeSlot,
        savePaymentMethod,
        selectedAddressId
      });
    } catch (err) {
      setOrderError(err.message || "Failed to place order");
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious food to get started!</p>
          <Link to="/" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition">
            Start Ordering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🛒 Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cartId || item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">₹{item.price}</p>
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="font-medium">Customizations: {item.customizations.map(c => `${c.name}: ${c.value}`).join(", ")}</p>
                      </div>
                    )}
                    {item.specialInstructions && (
                      <p className="mt-2 text-sm text-gray-500">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                    <button
                      onClick={() => updateQuantity(item.cartId || item._id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 bg-white rounded hover:bg-gray-200 transition font-semibold"
                    >
                      −
                    </button>
                    <div className="px-4 py-1 text-center font-semibold min-w-[3rem]">{item.quantity}</div>
                    <button
                      onClick={() => updateQuantity(item.cartId || item._id, item.quantity + 1)}
                      className="px-3 py-1 bg-white rounded hover:bg-gray-200 transition font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId || item._id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Order Summary</h2>
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length}):</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 mt-4">
                <span>Total:</span>
                <span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setShowCheckout(!showCheckout)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                {showCheckout ? "Hide Checkout" : "Proceed to Checkout"}
              </button>
            </div>

            {/* Checkout Section */}
            {showCheckout && (
              <div className="space-y-6">
                {/* Address */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📍 Delivery Address</h3>
                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <div key={addr._id} className={`p-4 border-2 rounded-lg transition ${selectedAddressId === addr._id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === addr._id}
                              onChange={() => setSelectedAddressId(addr._id)}
                              className="mt-1 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-semibold">{addr.label} {addr.isDefault && "⭐"}</div>
                              <p className="text-sm text-gray-600">{addr.street}</p>
                              <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Address Form */}
                  {showAddForm && (
                    <form className="space-y-3 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {editingAddressId ? "✏️ Edit Address" : "➕ Add New Address"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-gray-700">Label</label>
                          <select
                            value={newAddressForm.label}
                            onChange={(e) => handleAddressFieldChange("label", e.target.value)}
                            className={`w-full p-2 border rounded ${addressErrors.label ? "border-red-500" : "border-gray-300"}`}
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                          {addressErrors.label && <p className="text-red-500 text-sm">{addressErrors.label}</p>}
                        </div>
                        <div>
                          <label className="text-sm text-gray-700">Country</label>
                          <input
                            type="text"
                            placeholder="Country"
                            value={newAddressForm.country}
                            onChange={(e) => handleAddressFieldChange("country", e.target.value)}
                            className={`w-full p-2 border rounded ${addressErrors.country ? "border-red-500" : "border-gray-300"}`}
                          />
                          {addressErrors.country && <p className="text-red-500 text-sm">{addressErrors.country}</p>}
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddressForm.street}
                        onChange={(e) => handleAddressFieldChange("street", e.target.value)}
                        className={`w-full p-2 border rounded ${addressErrors.street ? "border-red-500" : "border-gray-300"}`}
                      />
                      {addressErrors.street && <p className="text-red-500 text-sm">{addressErrors.street}</p>}

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddressForm.city}
                          onChange={(e) => handleAddressFieldChange("city", e.target.value)}
                          className={`p-2 border rounded ${addressErrors.city ? "border-red-500" : "border-gray-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddressForm.state}
                          onChange={(e) => handleAddressFieldChange("state", e.target.value)}
                          className={`p-2 border rounded ${addressErrors.state ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={newAddressForm.zipCode}
                        onChange={(e) => handleAddressFieldChange("zipCode", e.target.value)}
                        className={`w-full p-2 border rounded ${addressErrors.zipCode ? "border-red-500" : "border-gray-300"}`}
                      />
                      {addressErrors.zipCode && <p className="text-red-500 text-sm">{addressErrors.zipCode}</p>}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          disabled={addressLoading}
                          className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                        >
                          {addressLoading ? "Saving..." : editingAddressId ? "💾 Update" : "➕ Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setEditingAddressId(null);
                            setNewAddressForm({ label: "Home", street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
                            setAddressErrors({});
                          }}
                          className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {!showAddForm && addresses.length < 5 && (
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setNewAddressForm({ label: "Home", street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
                        setAddressErrors({});
                        setEditingAddressId(null);
                      }}
                      className="w-full py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 font-medium"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {/* Payment */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Payment Method</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${paymentMethod === "COD" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                      <span className="ml-3 font-medium">Cash on Delivery</span>
                    </label>
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${paymentMethod === "ONLINE" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} />
                      <span className="ml-3 font-medium">Online Payment</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🚚 Delivery</h3>
                  <div className="space-y-3 mb-4">
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${deliveryType === "instant" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                      <input type="radio" name="delivery" checked={deliveryType === "instant"} onChange={() => setDeliveryType("instant")} />
                      <span className="ml-3 font-medium">Instant Delivery</span>
                    </label>
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer ${deliveryType === "scheduled" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                      <input type="radio" name="delivery" checked={deliveryType === "scheduled"} onChange={() => setDeliveryType("scheduled")} />
                      <span className="ml-3 font-medium">Schedule for Later</span>
                    </label>
                  </div>

                  {deliveryType === "scheduled" && (
                    <div className="space-y-3">
                      <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full p-2 border rounded" />
                      {isLoadingSlots ? (
                        <p className="text-gray-600">Loading slots...</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots.map((s) => (
                            <label key={s.slot} className={`flex items-center p-2 border rounded cursor-pointer ${!s.available ? "opacity-50 cursor-not-allowed" : ""}`}>
                              <input type="radio" name="slot" disabled={!s.available} checked={timeSlot === s.slot} onChange={() => setTimeSlot(s.slot)} />
                              <span className="ml-2 text-sm">{s.slot}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {orderError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {orderError}
                  </div>
                )}

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition text-lg"
                >
                  {isPlacingOrder ? "⏳ Placing Order..." : `✓ Place Order - ₹${grandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
