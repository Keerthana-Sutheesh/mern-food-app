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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
          <div className="animate-spin h-16 w-16 border-b-4 border-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <span className="text-3xl md:text-4xl">👑</span> Admin Dashboard
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">Manage your platform with powerful administrative tools</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            {[
              { id: "stats", label: "Dashboard 📊", icon: "📈" },
              { id: "restaurants", label: "Restaurants 🏪", icon: "🍽️" },
              { id: "users", label: "Users 👥", icon: "👤" },
              { id: "moderation", label: "Feedback ⚖️", icon: "💬" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex-1 px-6 py-5 font-semibold text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

     
        {activeTab === "stats" && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-blue-600", bgColor: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" },
              { label: "Total Restaurants", value: stats.totalRestaurants, icon: "🏪", color: "from-green-500 to-green-600", bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" },
              { label: "Approved Restaurants", value: stats.approvedRestaurants, icon: "✅", color: "from-purple-500 to-purple-600", bgColor: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20" },
              { label: "Pending Restaurants", value: stats.pendingRestaurants, icon: "⏳", color: "from-orange-500 to-orange-600", bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20" }
            ].map((item, index) => (
              <div
                key={item.label}
                className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className={`text-right text-sm font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    +{Math.floor(Math.random() * 20)}%
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold text-base mb-2">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        )}

  
        {activeTab === "restaurants" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">🏪</span> Restaurant Management
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">Approve or reject restaurant applications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Restaurant</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Owner</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Status</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r, index) => (
                    <tr
                      key={r._id}
                      className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/30 dark:hover:to-blue-900/10 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🍕</span>
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-bold text-base">{r.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">ID: {r._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold text-base">{r.owner?.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{r.owner?.email}</p>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${
                          r.isApproved
                            ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600'
                            : 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600'
                        }`}>
                          <span className="text-base">{r.isApproved ? "✅" : "⏳"}</span>
                          {r.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <button
                          onClick={() => approveRestaurant(r._id, !r.isApproved)}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                            r.isApproved
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 dark:shadow-red-900/50'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 dark:shadow-green-900/50'
                          }`}
                        >
                          <span className="text-base">{r.isApproved ? "❌" : "✅"}</span>
                          {r.isApproved ? "Reject" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">👥</span> User Management
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">View and manage all platform users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">User</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Email</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Role</th>
                    <th className="text-left text-gray-900 dark:text-white font-bold py-4 px-6 text-base">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 dark:hover:from-gray-700/30 dark:hover:to-purple-900/10 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-bold text-base">{u.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">ID: {u._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold text-base">{u.email}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Verified</p>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600'
                            : u.role === 'owner'
                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-600'
                            : 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600'
                        }`}>
                          <span className="text-base">
                            {u.role === 'admin' ? '👑' : u.role === 'owner' ? '🏪' : '👤'}
                          </span>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600">
                          <span className="text-base">✅</span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "moderation" && (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-3xl">⚖️</span> Feedback Moderation
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300">Review and moderate user feedback</p>
            </div>
            <FeedbackModeration />
          </div>
        )}
      </div>
    </div>
  );
}
