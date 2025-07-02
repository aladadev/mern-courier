import React, { useState, useEffect } from "react";
import { Search, Eye, Edit, MoreHorizontal } from "lucide-react";
import { updateUserRole } from "../../api/endpoints";
import toast from "react-hot-toast";

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(""); // userId for which action is loading

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await import("../../api/endpoints").then((m) =>
          m.getAllUsers(token, 1, 100, "")
        );
        setUsers(
          (res.data.data.users || []).map((u) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            bookings: u.totalBookings || 0,
            joined: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString()
              : "-",
            role: u.role,
          }))
        );
      } catch (e) {
        setError(e.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const handleRoleUpdate = async (userId, newRole) => {
    setActionLoading(userId + newRole);
    try {
      await updateUserRole(userId, newRole, token);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User promoted to ${newRole}`);
    } catch (e) {
      toast.error(e.message || "Failed to update user role");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">View and manage all registered users</p>
        </div>
        
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-700">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={16} />
                      </button>
                      {user.role !== "agent" && (
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs border border-blue-100"
                          disabled={actionLoading === user.id + "agent"}
                          onClick={() => handleRoleUpdate(user.id, "agent")}
                        >
                          {actionLoading === user.id + "agent"
                            ? "Promoting..."
                            : "Promote to Agent"}
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          className="p-1 text-green-600 hover:bg-green-50 rounded text-xs border border-green-100"
                          disabled={actionLoading === user.id + "admin"}
                          onClick={() => handleRoleUpdate(user.id, "admin")}
                        >
                          {actionLoading === user.id + "admin"
                            ? "Promoting..."
                            : "Promote to Admin"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;
