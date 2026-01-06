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
    return <div className="text-center py-10">Loading feedback...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Feedback</h2>

   
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Overall Rating" value={stats.avgOverallRating || 0} />
          <Stat label="Food Rating" value={stats.avgRestaurantRating || 0} />
          <Stat label="Delivery Rating" value={stats.avgDeliveryRating || 0} />
          <Stat label="Total Reviews" value={stats.totalReviews || 0} />
        </div>
      )}

      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback yet</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb._id} className="border rounded p-4 mb-4">
            <div className="flex justify-between">
              <p className="font-semibold">
                {fb.user?.name || "Anonymous"}
              </p>
              <div className="text-right">
                <p className="text-orange-500 font-bold">
                  ⭐ {fb.overallRating || 0}
                </p>
                {fb.restaurantRating && (
                  <p className="text-sm text-gray-600">
                    Food: ⭐ {fb.restaurantRating}
                  </p>
                )}
                {fb.deliveryRating && (
                  <p className="text-sm text-gray-600">
                    Delivery: ⭐ {fb.deliveryRating}
                  </p>
                )}
              </div>
            </div>

            {fb.overallComment && (
              <p className="text-gray-700 mt-2">{fb.overallComment}</p>
            )}

            {fb.restaurantComment && (
              <p className="text-gray-700 mt-1 text-sm">
                <strong>Food:</strong> {fb.restaurantComment}
              </p>
            )}

            {fb.deliveryComment && (
              <p className="text-gray-700 mt-1 text-sm">
                <strong>Delivery:</strong> {fb.deliveryComment}
              </p>
            )}

            {fb.restaurantResponse ? (
              <div className="mt-3 bg-gray-100 p-3 rounded">
                <p className="text-sm font-semibold text-gray-700">
                  Your Response
                </p>
                {replying === fb._id ? (
                  <>
                    <textarea
                      className="w-full border p-2 rounded"
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
                        className="bg-orange-500 text-white px-4 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setReplying(null)}
                        className="bg-gray-400 text-white px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">{fb.restaurantResponse.comment}</p>
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setReplyText((prev) => ({ ...prev, [fb._id]: fb.restaurantResponse.comment }));
                          setReplying(fb._id);
                        }}
                        className="text-blue-500"
                      >
                        Edit
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
                      className="w-full border p-2 rounded"
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
                        className="bg-orange-500 text-white px-4 py-1 rounded"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setReplying(null)}
                        className="bg-gray-400 text-white px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setReplying(fb._id)}
                    className="text-blue-500 mt-2"
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
}

function Stat({ label, value }) {
  return (
    <div className="border rounded p-4 text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
