import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPaymentHistory, getPaymentReceipt } from "../api/payment";
import { useAuth } from "../context/auth";

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [page]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await getPaymentHistory({ page, limit: 10 });
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Failed to load payment history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await getPaymentReceipt(paymentId);
      console.log("Receipt data:", response.data);
      alert("Receipt download would be implemented here");
    } catch (err) {
      console.error("Failed to get receipt:", err);
      alert("Failed to download receipt");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-800/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600',
      failed: 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600',
      created: 'bg-gradient-to-r from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-800/40 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600',
      refunded: 'bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: '✅',
      failed: '❌',
      created: '⏳',
      refunded: '↩️'
    };
    return icons[status] || '❓';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-4">
            <span className="text-4xl">💳</span> Payment History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Track all your payment transactions and receipts</p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg dark:shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination?.total || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/orders"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl">📦</span>
            <span>View Orders</span>
          </Link>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-800 dark:text-red-200 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-12 text-center">
            <div className="text-8xl mb-6">💳</div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">No payment history</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              You haven't made any payments yet. Start your food journey today!
            </p>
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3"
            >
              <span className="text-3xl">🛒</span>
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => (
              <div key={payment._id} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-8 hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-3xl flex items-center justify-center">
                      <span className="text-3xl">💳</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment #{payment._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {payment.orderId && (
                        <Link
                          to={`/orders/${payment.orderId._id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-lg font-semibold inline-flex items-center gap-2 transition-all"
                        >
                          <span className="text-xl">📦</span>
                          <span>View Order</span>
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold mb-3 ${getStatusColor(payment.status)}`}>
                      <span className="text-lg">{getStatusIcon(payment.status)}</span>
                      <span>{payment.status.toUpperCase()}</span>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatAmount(payment.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🔢</span> Transaction ID
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-mono">
                      {payment.razorpayPaymentId || payment.transactionId || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">💳</span> Payment Method
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {payment.paymentMethod?.type || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">💰</span> Currency
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {payment.currency.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-300">
                    {payment.receipt && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <span className="text-sm">Receipt generated on {new Date(payment.receipt.generatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {payment.status === 'success' && (
                      <button
                        onClick={() => handleDownloadReceipt(payment._id)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-lg">📄</span>
                        <span>Download Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl p-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-900 dark:text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      <span className="text-lg">⬅️</span>
                      <span>Previous</span>
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-3 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                      disabled={page === pagination.pages}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-900 dark:text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      <span>Next</span>
                      <span className="text-lg">➡️</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}