import { useState, useEffect } from 'react';
import {
  getRestaurantFeedback,
  markFeedbackHelpful,
  reportFeedback,
  respondToFeedback,
  submitFeedback
} from '../api/feedback';
import { useAuth } from '../context/auth';

const RestaurantFeedback = ({ restaurantId, orderId, isOwner = false }) => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadFeedback();
  }, [restaurantId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const res = await getRestaurantFeedback(restaurantId);
      setFeedbacks(res?.data?.feedbacks || []);
      setStats(res?.data?.stats || null);
    } catch (err) {
      console.error('Load feedback failed:', err);
      setFeedbacks([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !comment.trim()) {
      alert('Please give rating and comment');
      return;
    }

    if (!orderId) {
      alert('Cannot submit feedback: missing order ID');
      return;
    }

    try {
      setSubmitting(true);
      await submitFeedback({
        orderId: orderId,
        restaurantId,
        overallRating: rating,
        overallComment: comment
      });

      setRating(0);
      setComment('');
      loadFeedback();
    } catch (err) {
      console.error('Submit feedback error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit feedback';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (id) => {
    try {
      await markFeedbackHelpful(id);
      setFeedbacks(prev =>
        prev.map(f => f._id === id ? { ...f, helpful: (f.helpful || 0) + 1 } : f)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (id) => {
    const reason = prompt('Reason for reporting?');
    if (!reason) return;
    try {
      await reportFeedback(id, reason);
      alert('Reported successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResponse = async (id) => {
    if (!responseText.trim()) return;
    try {
      await respondToFeedback(id, responseText);
      setRespondingTo(null);
      setResponseText('');
      await loadFeedback();
    } catch (err) {
      console.error(err);
    }
  };
  const renderStars = (value = 0, clickable = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          disabled={!clickable}
          onClick={() => clickable && setRating(i)}
          className={`text-xl ${i <= value ? 'text-orange-500' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-6">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">

      {!isOwner && user && orderId && (
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold mb-2">Leave a Review</h3>
          {renderStars(rating, true)}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows="3"
            className="w-full border p-2 mt-2 rounded"
            placeholder="Share your experience..."
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={submitting}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}

   
      {stats && (
        <div className="bg-white p-5 rounded shadow">
          <p className="text-lg font-semibold">
            {stats.totalReviews || 0} Reviews • ⭐ {stats.avgOverallRating || 0}
          </p>
        </div>
      )}


      {Array.isArray(feedbacks) && feedbacks.length === 0 ? (
        <div className="bg-white p-6 rounded text-center text-gray-500">
          No reviews yet
        </div>
      ) : (
        feedbacks.map(f => (
          <div key={f._id} className="bg-white p-5 rounded shadow">
            <div className="flex justify-between">
              <p className="font-medium">{f.user?.name || 'Anonymous'}</p>
              {renderStars(f.overallRating)}
            </div>

            <p className="mt-2 text-gray-700">{f.overallComment}</p>

            <div className="flex gap-4 text-sm mt-3">
              <button onClick={() => handleHelpful(f._id)}>
                👍 Helpful ({f.helpful || 0})
              </button>
              <button onClick={() => handleReport(f._id)}>🚨 Report</button>
            </div>

            {f.restaurantResponse && (
              <div className="mt-3 bg-green-50 p-3 rounded">
                <strong>Owner response:</strong>
                <p>{f.restaurantResponse.comment}</p>
              </div>
            )}

            {isOwner && !f.restaurantResponse && (
              <div className="mt-3">
                {respondingTo === f._id ? (
                  <>
                    <textarea
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                    <button
                      onClick={() => handleResponse(f._id)}
                      className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Submit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setRespondingTo(f._id)}
                    className="text-green-600"
                  >
                    Respond
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default RestaurantFeedback;