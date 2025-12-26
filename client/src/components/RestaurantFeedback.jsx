// components/RestaurantFeedback.jsx
import { useState, useEffect } from 'react';
import { getRestaurantFeedback, markFeedbackHelpful, reportFeedback, respondToFeedback } from '../api/feedback';
import { useAuth } from '../context/auth';

const RestaurantFeedback = ({ restaurantId, isOwner = false }) => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ rating: '', type: '' });
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadFeedback();
  }, [restaurantId, filter]);

  const loadFeedback = async () => {
    try {
      const response = await getRestaurantFeedback(restaurantId, filter);
      setFeedbacks(response.data.feedbacks);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (feedbackId) => {
    try {
      await markFeedbackHelpful(feedbackId);
     
      setFeedbacks(prev => prev.map(f =>
        f._id === feedbackId ? { ...f, helpful: f.helpful + 1 } : f
      ));
    } catch (error) {
      console.error('Failed to mark as helpful:', error);
    }
  };

  const handleReport = async (feedbackId) => {
    const reason = prompt('Why are you reporting this feedback?');
    if (reason) {
      try {
        await reportFeedback(feedbackId, reason);
        alert('Feedback reported. Thank you for your feedback.');
      } catch (error) {
        console.error('Failed to report feedback:', error);
      }
    }
  };

  const handleResponse = async (feedbackId) => {
    if (!responseText.trim()) return;

    try {
      await respondToFeedback(feedbackId, responseText);
      setRespondingTo(null);
      setResponseText('');
      loadFeedback(); // Reload to show the response
    } catch (error) {
      console.error('Failed to submit response:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
 
      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.avgOverallRating}</div>
              <div className="flex justify-center mb-2">{renderStars(Math.round(stats.avgOverallRating))}</div>
              <div className="text-sm text-gray-600">{stats.totalReviews} reviews</div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rating Breakdown</h4>
              <div className="space-y-1">
                {stats.distribution.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Average Ratings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Restaurant:</span>
                  <span>{stats.avgRestaurantRating}★</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{stats.avgDeliveryRating}★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

  
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.rating}
            onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="food_quality">Food Quality</option>
            <option value="service">Service</option>
            <option value="ambiance">Ambiance</option>
            <option value="value">Value</option>
            <option value="overall">Overall</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{feedback.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {renderStars(feedback.overallRating)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleHelpful(feedback._id)}
                    className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1"
                  >
                    👍 Helpful ({feedback.helpful})
                  </button>
                  <button
                    onClick={() => handleReport(feedback._id)}
                    className="text-sm text-gray-600 hover:text-red-600"
                  >
                    🚨 Report
                  </button>
                </div>
              </div>

              {/* Restaurant Feedback */}
              {feedback.restaurantRating && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-orange-800">🍽️ Restaurant</span>
                    {renderStars(feedback.restaurantRating)}
                  </div>
                  {feedback.restaurantComment && (
                    <p className="text-sm text-gray-700">{feedback.restaurantComment}</p>
                  )}
                  <span className="text-xs text-orange-600 capitalize">
                    {feedback.restaurantFeedbackType.replace('_', ' ')}
                  </span>
                </div>
              )}

              {/* Delivery Feedback */}
              {feedback.deliveryRating && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-800">🚚 Delivery</span>
                    {renderStars(feedback.deliveryRating)}
                  </div>
                  {feedback.deliveryComment && (
                    <p className="text-sm text-gray-700">{feedback.deliveryComment}</p>
                  )}
                  <span className="text-xs text-blue-600 capitalize">
                    {feedback.deliveryFeedbackType.replace('_', ' ')}
                  </span>
                </div>
              )}

             
              {feedback.overallComment && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{feedback.overallComment}</p>
                </div>
              )}

            
              {feedback.restaurantResponse && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-800">💬 Restaurant Response</span>
                    <span className="text-xs text-green-600">
                      {new Date(feedback.restaurantResponse.respondedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.restaurantResponse.comment}</p>
                </div>
              )}

            
              {isOwner && !feedback.restaurantResponse && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {respondingTo === feedback._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response to this feedback..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResponse(feedback._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Submit Response
                        </button>
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(feedback._id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Respond to this review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantFeedback;