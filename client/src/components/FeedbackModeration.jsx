import { useState, useEffect } from 'react';
import { getPendingModeration, moderateFeedback, getFeedbackStats } from '../api/feedback';

const FeedbackModeration = () => {
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [moderating, setModerating] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      const [pendingResponse, statsResponse] = await Promise.all([
        getPendingModeration({ page: currentPage, limit: 10 }),
        getFeedbackStats()
      ]);

      setPendingFeedback(pendingResponse.data.feedbacks);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (feedbackId, status, reason = '') => {
    try {
      await moderateFeedback(feedbackId, status, reason);
      setModerating(null);
      loadData();
    } catch (error) {
      console.error('Failed to moderate feedback:', error);
      alert('Failed to moderate feedback');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-6">
    
      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.statusBreakdown.find(s => s._id === 'approved')?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.statusBreakdown.find(s => s._id === 'pending')?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.statusBreakdown.find(s => s._id === 'rejected')?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-orange-600">
              Average Rating: {stats.averageRating}★
            </div>
          </div>
        </div>
      )}

     
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Pending Moderation ({pendingFeedback.length})
        </h3>

        {pendingFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews pending moderation. Great job! 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFeedback.map((feedback) => (
              <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">{feedback.user.name}</div>
                    <div className="text-sm text-gray-600">
                      {feedback.restaurant?.name} • {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {renderStars(feedback.overallRating)}
                </div>

         
                <div className="space-y-3 mb-4">
                  {feedback.restaurantComment && (
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="text-sm font-medium text-orange-800 mb-1">🍽️ Restaurant</div>
                      <p className="text-sm text-gray-700">{feedback.restaurantComment}</p>
                    </div>
                  )}

                  {feedback.deliveryComment && (
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm font-medium text-blue-800 mb-1">🚚 Delivery</div>
                      <p className="text-sm text-gray-700">{feedback.deliveryComment}</p>
                    </div>
                  )}

                  {feedback.overallComment && (
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{feedback.overallComment}</p>
                    </div>
                  )}
                </div>

           
                {moderating === feedback._id ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Reason for rejection (optional)"
                      className="w-full p-2 border border-gray-300 rounded resize-none"
                      rows="2"
                      id={`reason-${feedback._id}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerate(feedback._id, 'approved')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = document.getElementById(`reason-${feedback._id}`).value;
                          handleModerate(feedback._id, 'rejected', reason);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => setModerating(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModerating(feedback._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Moderate
                    </button>
                    <button
                      onClick={() => handleModerate(feedback._id, 'flagged')}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition"
                    >
                      Flag
                    </button>
                  </div>
                )}
              </div>
            ))}

         
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 border-t border-b border-gray-300 bg-gray-50">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={pendingFeedback.length < 10}
                className="px-3 py-1 border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModeration;