import { useMemo } from "react";

export function useCartTotals(cartItems) {
  return useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = cartItems.length ? 40 : 0;
    const grandTotal = subtotal + deliveryFee;

    return { subtotal, deliveryFee, grandTotal };
  }, [cartItems]);
}
