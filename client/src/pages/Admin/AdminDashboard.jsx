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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

    
        <div className="bg-white rounded shadow mb-6">
          <div className="flex border-b">
            {[
              { id: "stats", label: "Dashboard 📊" },
              { id: "restaurants", label: "Restaurants 🏪" },
              { id: "users", label: "Users 👥" },
              { id: "moderation", label: "Feedback Moderation ⚖️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`px-6 py-4 font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500"
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
              <div key={item.label} className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        )}

  
        {activeTab === "restaurants" && (
          <div className="bg-white p-6 rounded shadow">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500">
                  <th>Restaurant</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td>{r.name}</td>
                    <td>{r.owner?.name}</td>
                    <td>{r.isApproved ? "Approved" : "Pending"}</td>
                    <td>
                      <button
                        onClick={() =>
                          approveRestaurant(r._id, !r.isApproved)
                        }
                        className={`font-medium ${
                          r.isApproved ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {r.isApproved ? "Reject" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded shadow">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500">
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="font-medium capitalize">{u.role}</td>
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
