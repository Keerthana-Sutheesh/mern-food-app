import { useState } from "react";
import { useOwnerFeedback } from "../../hooks/useOwnerFeedback";

export default function OwnerFeedback({ restaurantId }) {
  const {
    feedbacks: rawFeedbacks,
    stats: rawStats,
    loading,
    replyToFeedback
  } = useOwnerFeedback(restaurantId);


  const feedbacks = Array.isArray(rawFeedbacks) ? rawFeedbacks : [];
  const stats = rawStats || null;

  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState(null);

  if (loading) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400 font-medium">⏳ Loading feedback...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-6 mt-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">⭐ Customer Feedback</h2>

   
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Overall Rating" value={stats.avgOverallRating || 0} />
          <Stat label="Food Rating" value={stats.avgRestaurantRating || 0} />
          <Stat label="Delivery Rating" value={stats.avgDeliveryRating || 0} />
          <Stat label="Total Reviews" value={stats.totalReviews || 0} />
        </div>
      )}

      {feedbacks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 font-medium text-center py-8">📭 No feedback yet</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <p className="font-bold text-gray-900 dark:text-white text-lg">
                👤 {fb.user?.name || "Anonymous"}
              </p>
              <div className="text-right">
                <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                  ⭐ {fb.overallRating || 0}
                </p>
                {fb.restaurantRating && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    🍔 Food: ⭐ {fb.restaurantRating}
                  </p>
                )}
                {fb.deliveryRating && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    🚚 Delivery: ⭐ {fb.deliveryRating}
                  </p>
                )}
              </div>
            </div>

            {fb.overallComment && (
              <p className="text-gray-800 dark:text-gray-200 mt-3 font-medium">{fb.overallComment}</p>
            )}

            {fb.restaurantComment && (
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                <strong>🍔 Food:</strong> {fb.restaurantComment}
              </p>
            )}

            {fb.deliveryComment && (
              <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
                <strong>🚚 Delivery:</strong> {fb.deliveryComment}
              </p>
            )}

            {fb.restaurantResponse ? (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                  📝 Your Response
                </p>
                {replying === fb._id ? (
                  <>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows="2"
                      value={replyText[fb._id] ?? fb.restaurantResponse.comment}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [fb._id]: e.target.value
                        }))
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          try {
                            await replyToFeedback(fb._id, replyText[fb._id] ?? fb.restaurantResponse.comment);
                            setReplying(null);
                          } catch (err) {
                            alert(err.response?.data?.message || 'Failed to save response');
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setReplying(null)}
                        className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{fb.restaurantResponse.comment}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setReplyText((prev) => ({ ...prev, [fb._id]: fb.restaurantResponse.comment }));
                          setReplying(fb._id);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {replying === fb._id ? (
                  <>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows="2"
                      placeholder="Write a response..."
                      value={replyText[fb._id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [fb._id]: e.target.value
                        }))
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          replyToFeedback(fb._id, replyText[fb._id])
                        }
                        className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        ✅ Submit
                      </button>
                      <button
                        onClick={() => setReplying(null)}
                        className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setReplying(fb._id)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors mt-2"
                  >
                    💬 Respond
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center bg-white dark:bg-gray-700/50">
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
