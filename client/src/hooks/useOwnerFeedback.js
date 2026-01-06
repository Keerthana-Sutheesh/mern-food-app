import { useEffect, useState } from "react";
import { getRestaurantFeedback, respondToFeedback } from "../api/feedback";

export function useOwnerFeedback(restaurantId) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getRestaurantFeedback(restaurantId);
      setFeedbacks(res.data.feedbacks);
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to load feedback", err);
    } finally {
      setLoading(false);
    }
  };

  const replyToFeedback = async (feedbackId, comment) => {
    try {
      await respondToFeedback(feedbackId, comment);
      await fetchFeedbacks();
    } catch (err) {
      console.error('Reply to feedback failed', err);
      throw err;
    }
  };

  useEffect(() => {
    if (restaurantId) fetchFeedbacks();
  }, [restaurantId]);

  return { feedbacks, stats, loading, replyToFeedback };
}
