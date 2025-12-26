import { createRazorpayOrder, verifyPayment } from "../api/payment";

export function useRazorpayPayment({ user, clearCart, navigate }) {
  const pay = async ({ orderId, savePaymentMethod }) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    const res = await createRazorpayOrder({ orderId, savePaymentMethod });
    const { razorpayOrderId, amount, currency, key } = res.data;

    const options = {
      key,
      amount,
      currency,
      name: "FoodApp",
      order_id: razorpayOrderId,
      handler: async (response) => {
        await verifyPayment({
          ...response,
          savePaymentMethod
        });
        clearCart();
        navigate(`/orders/${orderId}`);
      },
      prefill: {
        name: user?.name,
        email: user?.email
      }
    };

    new window.Razorpay(options).open();
  };

  return pay;
}
