import { useEffect, useState } from "react";
import { getSavedPaymentMethods, deleteSavedPaymentMethod, setDefaultPaymentMethod } from "../api/payment";
import { useAuth } from "../context/auth";

export default function SavedPaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await getSavedPaymentMethods();
      setPaymentMethods(response.data);
    } catch (err) {
      setError("Failed to load payment methods");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (id) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await deleteSavedPaymentMethod(id);
      setPaymentMethods(paymentMethods.filter(method => method._id !== id));
    } catch (err) {
      console.error("Failed to delete payment method:", err);
      alert("Failed to delete payment method");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultPaymentMethod(id);
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method._id === id
      })));
    } catch (err) {
      console.error("Failed to set default payment method:", err);
      alert("Failed to set default payment method");
    }
  };

  const getMethodIcon = (type) => {
    const icons = {
      card: '💳',
      upi: '📱',
      netbanking: '🏦'
    };
    return icons[type] || '💳';
  };

  const formatCardNumber = (method) => {
    if (method.type === 'card') {
      return `**** **** **** ${method.card?.last4 || '****'}`;
    } else if (method.type === 'upi') {
      return method.upi?.id || 'UPI ID';
    } else if (method.type === 'netbanking') {
      return method.netbanking?.bankName || 'Net Banking';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Payment Methods</h1>
          <button
            onClick={() => alert('Add new payment method feature would be implemented here')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            + Add New Method
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No saved payment methods</h2>
            <p className="text-gray-600 mb-6">
              Save your payment methods for faster checkout next time.
            </p>
            <button
              onClick={() => alert('Add payment method feature would be implemented here')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getMethodIcon(method.type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {method.nickname || formatCardNumber(method)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {formatCardNumber(method)}
                        {method.type === 'card' && method.card?.brand && (
                          <span className="ml-2 capitalize">• {method.card.brand}</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Added on {new Date(method.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {method.isDefault && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}

                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Set as Default
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMethod(method._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {method.type === 'card' && method.card && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-2 capitalize">{method.card.brand}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Issuer:</span>
                        <span className="ml-2">{method.card.issuer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expiry:</span>
                        <span className="ml-2">
                          {method.card.expiryMonth}/{method.card.expiryYear}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2">
                          {method.card.international ? 'International' : 'Domestic'}
                          {method.card.emi && ' • EMI Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-blue-700 text-sm">
            Your payment information is securely stored and encrypted. We never store your full card details or CVV numbers.
          </p>
        </div>
      </div>
    </div>
  );
}