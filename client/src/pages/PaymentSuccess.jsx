import { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { CartContext } from '../context/cart';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const orderId = searchParams.get('orderId');

        if (!orderId) {
          setError('Invalid payment parameters');
          setLoading(false);
          return;
        }

        clearCart();
        setLoading(false);

        // Redirect to order details after a short delay
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2000);

      } catch (err) {
        console.error('Payment processing failed:', err);
        setError('Payment processing failed. Please contact support.');
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Payment Failed</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Your order has been confirmed and is being prepared.</p>
        <p className="text-sm text-gray-500">Redirecting to order details...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;