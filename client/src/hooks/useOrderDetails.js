import { useEffect, useState } from "react";
import api from "../api/api";

export const useOrderDetails = (orderId) => {
  const [order, setOrder] = useState(null);
  const [deliverySchedule, setDeliverySchedule] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/orders/${orderId}`);
        setOrder(res.data.order);
        setDeliverySchedule(res.data.deliverySchedule);
        setFeedback(res.data.feedback);
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  return { order, deliverySchedule, feedback, loading };
};
