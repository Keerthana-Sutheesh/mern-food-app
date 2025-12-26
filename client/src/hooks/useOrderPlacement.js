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
    if (!user || !cartItems.length) return;

    const restaurantId = cartItems[0].restaurant;

    const orderRes = await createOrder({
      restaurantId,
      paymentMethod,
      deliveryAddress,
      cartItems
    });

    const order = orderRes.data.order;

    await createDeliverySchedule({
      orderId: order._id,
      deliveryType,
      scheduledDate,
      scheduledTime,
      timeSlot,
      deliveryNotes
    });

    if (paymentMethod === "ONLINE") {
      await payOnline({ orderId: order._id, savePaymentMethod });
    } else {
      clearCart();
      navigate(`/orders/${order._id}`);
    }
  };

  return placeOrder;
}
