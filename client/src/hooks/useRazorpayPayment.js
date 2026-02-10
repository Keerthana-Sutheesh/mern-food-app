import { createRazorpayOrder, verifyPayment } from "../api/payment";

export function useRazorpayPayment({ user, clearCart, navigate }) {
  const pay = async ({ orderId, savePaymentMethod }) => {
    try {
      if (!orderId) {
        alert("Order ID is missing. Please try again.");
        return;
      }

      console.log("Creating Razorpay order for orderId:", orderId);

      const res = await createRazorpayOrder({ orderId, savePaymentMethod });

      if (!res.data) {
        alert("Payment configuration error. Please try again.");
        return;
      }

      // Check for specific error types
      if (res.data.error === 'RAZORPAY_NOT_CONFIGURED' || res.data.error === 'INVALID_RAZORPAY_KEY') {
        alert("Online payment is not configured properly. Please contact support or try Cash on Delivery.");
        return;
      }

      const { razorpayOrderId, razorpayKeyId, amount, currency, userEmail, userName } = res.data;

      console.log("Razorpay order created:", { razorpayOrderId, amount, currency });

      if (!razorpayKeyId) {
        alert("Payment configuration incomplete. Please contact support.");
        return;
      }

      // Initialize Razorpay
      const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          // Check if script already exists
          const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
          if (existingScript && window.Razorpay) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      };

      try {
        await loadRazorpayScript();

        if (!window.Razorpay) {
          throw new Error('Razorpay SDK not loaded');
        }

        const options = {
          key: razorpayKeyId,
          amount: amount,
          currency: currency,
          order_id: razorpayOrderId,
          name: 'Online Food Delivery',
          description: `Order #${orderId}`,
          image: 'https://your-logo-url.com/logo.png',
          handler: async (response) => {
            try {
              console.log("Payment response:", response);

              // Verify payment with backend
              const verifyRes = await verifyPayment({
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderId
              });

              if (verifyRes.data.message === 'Payment verified successfully') {
                alert('Payment successful! Your order has been placed.');
                clearCart();
                navigate('/orders');
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              alert(`Payment verification failed: ${error.response?.data?.message || error.message}`);
            }
          },
          prefill: {
            name: userName,
            email: userEmail
          },
          notes: {
            orderId: orderId
          },
          theme: {
            color: '#F97316'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error("Payment failed:", response.error);
          alert(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } catch (scriptError) {
        console.error("Razorpay SDK loading error:", scriptError);
        alert(`Failed to load payment gateway. Please check your internet connection and try again.`);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Failed to initialize payment";
      alert(`Payment initialization failed: ${errorMessage}`);
    }
  };

  return pay;
}
