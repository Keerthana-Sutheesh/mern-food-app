import { useEffect, useState } from "react";
import { getSavedPaymentMethods } from "../api/payment";

export function useSavedPayments(user, showCheckout) {
  const [savedMethods, setSavedMethods] = useState([]);

  useEffect(() => {
    if (!user || !showCheckout) return;

    const load = async () => {
      try {
        const res = await getSavedPaymentMethods();
        setSavedMethods(res.data);
      } catch (err) {
        console.error("Failed to load saved payments", err);
      }
    };

    load();
  }, [user, showCheckout]);

  return savedMethods;
}
