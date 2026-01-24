import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import FeedbackModeration from "../../components/FeedbackModeration";

export default function AdminDashboard() {
  const {
    stats,
    restaurants,
    users,
    activeTab,
    loading,
    changeTab,
    approveRestaurant
  } = useAdminDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">📊 Admin Dashboard</h1>

    
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "stats", label: "Dashboard 📊" },
              { id: "restaurants", label: "Restaurants 🏪" },
              { id: "users", label: "Users 👥" },
              { id: "moderation", label: "Feedback Moderation ⚖️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

     
        {activeTab === "stats" && stats && (
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Total Users", value: stats.totalUsers },
              { label: "Restaurants", value: stats.totalRestaurants },
              { label: "Approved", value: stats.approvedRestaurants },
              { label: "Pending", value: stats.pendingRestaurants }
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        )}

  
        {activeTab === "restaurants" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Restaurant</th>
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Owner</th>
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Status</th>
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{r.name}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{r.owner?.name}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        r.isApproved 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {r.isApproved ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          approveRestaurant(r._id, !r.isApproved)
                        }
                        className={`px-4 py-1 rounded font-semibold transition-colors ${
                          r.isApproved 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {r.isApproved ? "❌ Reject" : "✅ Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="text-gray-900 dark:text-white font-bold pb-3">User</th>
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Email</th>
                  <th className="text-gray-900 dark:text-white font-bold pb-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{u.name}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="py-3 font-semibold capitalize">
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "moderation" && (
          <FeedbackModeration />
        )}
      </div>
    </div>
  );
}
