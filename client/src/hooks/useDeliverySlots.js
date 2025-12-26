import { useEffect, useState } from "react";
import { getAvailableTimeSlots } from "../api/deliverySchedule";

export function useDeliverySlots(scheduledDate, deliveryType) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scheduledDate || deliveryType !== "scheduled") return;

    const loadSlots = async () => {
      setLoading(true);
      try {
        const res = await getAvailableTimeSlots(scheduledDate);
        setSlots(res.data.availableSlots || []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [scheduledDate, deliveryType]);

  return { slots, loading };
}
