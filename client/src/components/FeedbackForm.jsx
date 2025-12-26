// components/FeedbackForm.jsx
import { useState } from 'react';
import { submitFeedback } from '../api/feedback';

const FeedbackForm = ({ orderId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    restaurantRating: 0,
    restaurantComment: '',
    restaurantFeedbackType: 'overall',
    deliveryRating: 0,
    deliveryComment: '',
    deliveryFeedbackType: 'overall',
    overallRating: 0,
    overallComment: ''
  });

  const handleRatingClick = (field, rating) => {
    setFeedback(prev => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitFeedback({ orderId, ...feedback });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (field, currentRating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(field, star)}
            className={`text-2xl ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Share Your Experience</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
       
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">🍽️ Restaurant Experience</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Restaurant Rating *
              </label>
              {renderStars('restaurantRating', feedback.restaurantRating)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What did you think about the food/service?
              </label>
              <select
                value={feedback.restaurantFeedbackType}
                onChange={(e) => setFeedback(prev => ({ ...prev, restaurantFeedbackType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="overall">Overall Experience</option>
                <option value="food_quality">Food Quality</option>
                <option value="service">Service</option>
                <option value="ambiance">Ambiance</option>
                <option value="value">Value for Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Comments
              </label>
              <textarea
                value={feedback.restaurantComment}
                onChange={(e) => setFeedback(prev => ({ ...prev, restaurantComment: e.target.value }))}
                placeholder="Tell us about your experience with the restaurant..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.restaurantComment.length}/1000 characters
              </p>
            </div>
          </div>
        </div>

       
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">🚚 Delivery Experience</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Rating
              </label>
              {renderStars('deliveryRating', feedback.deliveryRating)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What aspect of delivery?
              </label>
              <select
                value={feedback.deliveryFeedbackType}
                onChange={(e) => setFeedback(prev => ({ ...prev, deliveryFeedbackType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="overall">Overall Delivery</option>
                <option value="speed">Delivery Speed</option>
                <option value="packaging">Packaging</option>
                <option value="communication">Communication</option>
                <option value="courtesy">Delivery Courtesy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Comments
              </label>
              <textarea
                value={feedback.deliveryComment}
                onChange={(e) => setFeedback(prev => ({ ...prev, deliveryComment: e.target.value }))}
                placeholder="How was your delivery experience?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.deliveryComment.length}/500 characters
              </p>
            </div>
          </div>
        </div>

     
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">📝 Overall Experience</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              {renderStars('overallRating', feedback.overallRating)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={feedback.overallComment}
                onChange={(e) => setFeedback(prev => ({ ...prev, overallComment: e.target.value }))}
                placeholder="Any final thoughts or suggestions?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.overallComment.length}/1000 characters
              </p>
            </div>
          </div>
        </div>

  
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !feedback.overallRating}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;