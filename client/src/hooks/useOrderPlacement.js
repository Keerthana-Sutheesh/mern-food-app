import { createOrder } from "../api/order";
import { createDeliverySchedule } from "../api/deliverySchedule";

export function useOrderPlacement({ cartItems, clearCart, navigate, payOnline }) {
  const placeOrder = async ({
    user,
    paymentMethod,
    deliveryAddress,
    deliveryType,
    scheduledDate,
    scheduledTime,
    timeSlot,
    deliveryNotes,
    savePaymentMethod
  }) => {
    console.log("useOrderPlacement called with paymentMethod:", paymentMethod);
    if (!user || !cartItems.length) return;

    const restaurantId = cartItems[0].restaurant;

    const orderRes = await createOrder({
      restaurantId,
      paymentMethod,
      deliveryAddress,
      cartItems
    });

    const order = orderRes.data.order;
    console.log("Order created:", order._id, "Payment method:", paymentMethod);

    await createDeliverySchedule({
      orderId: order._id,
      deliveryType,
      scheduledDate,
      scheduledTime,
      timeSlot,
      deliveryNotes
    });

    if (paymentMethod === "ONLINE") {
      console.log("Initiating online payment for order:", order._id);
      await payOnline({ orderId: order._id, savePaymentMethod });
    } else {
      console.log("COD order - clearing cart and navigating");
      clearCart();
      navigate(`/orders/${order._id}`);
    }
  };

  return placeOrder;
}
