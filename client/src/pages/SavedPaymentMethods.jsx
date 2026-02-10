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

  const getMethodColor = (type) => {
    const colors = {
      card: 'from-blue-500 to-purple-600',
      upi: 'from-green-500 to-emerald-600',
      netbanking: 'from-orange-500 to-red-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-4">
            <span className="text-4xl">💳</span> Saved Payment Methods
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Manage your saved payment methods for faster checkout</p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Saved Methods</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{paymentMethods.length}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert('Add new payment method feature would be implemented here')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl">➕</span>
            <span>Add New Method</span>
          </button>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-12 text-center">
            <div className="text-8xl mb-6">💳</div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">No saved payment methods</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Save your payment methods for faster and more convenient checkout experiences.
            </p>
            <button
              onClick={() => alert('Add payment method feature would be implemented here')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3"
            >
              <span className="text-3xl">💳</span>
              <span>Add Payment Method</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {paymentMethods.map((method) => (
              <div key={method._id} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8 hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getMethodColor(method.type)} rounded-3xl flex items-center justify-center shadow-lg`}>
                      <span className="text-3xl text-white">{getMethodIcon(method.type)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {method.nickname || formatCardNumber(method)}
                        </h3>
                        {method.isDefault && (
                          <span className="bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold border border-green-300 dark:border-green-600 flex items-center gap-1">
                            <span className="text-lg">⭐</span>
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mb-1">
                        {formatCardNumber(method)}
                        {method.type === 'card' && method.card?.brand && (
                          <span className="ml-2 capitalize font-semibold">• {method.card.brand}</span>
                        )}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>Added on {new Date(method.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method._id)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-lg">⭐</span>
                        <span>Set as Default</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteMethod(method._id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                    >
                      <span className="text-lg">🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {method.type === 'card' && method.card && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-xl">📋</span> Card Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Brand</span>
                        <p className="text-gray-900 dark:text-white font-bold capitalize text-lg">{method.card.brand}</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Issuer</span>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">{method.card.issuer}</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Expiry</span>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">
                          {method.card.expiryMonth}/{method.card.expiryYear}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Type</span>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">
                          {method.card.international ? 'International' : 'Domestic'}
                          {method.card.emi && <span className="text-green-600 dark:text-green-400"> • EMI Available</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🔒</span>
            <div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span> Security & Privacy
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">
                Your payment information is securely stored and encrypted using industry-standard security measures.
                We never store your full card details, CVV numbers, or any sensitive authentication information.
                All transactions are processed through secure payment gateways compliant with PCI DSS standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}