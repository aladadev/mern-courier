import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/Sidebar";
import DashboardContent from "../components/admin/DashboardContent";
import ParcelManagement from "../components/admin/ParcelManagement";
import UserManagement from "../components/admin/UserManagement";
import Reports from "../components/admin/Reports";
import useBookingManagement from "../components/admin/useBookingManagement";
import { getDashboardMetrics } from "../api/endpoints";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { logout as apiLogout } from "../api/endpoints";
import { useNavigate } from "react-router";
import { getDailyAnalytics, getRevenueAnalytics } from "../api/endpoints";
import { BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    bookings,
    handleAgentAssignment,
    loading,
    error,
    agents,
    page,
    setPage,
    search,
    setSearch,
  } = useBookingManagement(token);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    dailyBookings: { value: 0, change: "0%", trend: "up" },
    failedDeliveries: { value: 0, change: "0%", trend: "down" },
    codAmounts: { value: "$0", change: "0%", trend: "up" },
    totalDeliveries: { value: 0, change: "0%", trend: "up" },
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getDashboardMetrics(
          token,
          "2024-01-01",
          "2024-12-31"
        );
        console.log("Admin Dashboard Metrics Response", res.data.data);
        setDashboardMetrics({
          dailyBookings: {
            value: res.data.data.totalBookings || 0,
            change: "+12%",
            trend: "up",
          },
          failedDeliveries: {
            value: res.data.data.failedDeliveries || 0,
            change: "-5%",
            trend: "down",
          },
          codAmounts: {
            value: `$${res.data.data.totalCODAmount || 0}`,
            change: "+8%",
            trend: "up",
          },
          totalDeliveries: {
            value: res.data.data.totalDeliveries || 0,
            change: "+15%",
            trend: "up",
          },
        });
      } catch (e) {
        console.error("Failed to fetch admin dashboard metrics", e);
        // fallback to default
      }
    };
    if (token) fetchMetrics();
  }, [token]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const dailyRes = await getDailyAnalytics(token, dateStr);
      const revenueRes = await getRevenueAnalytics(
        token,
        dateStr,
        dateStr,
        "daily"
      );
      setAnalyticsData({
        daily: dailyRes.data.data,
        revenue: revenueRes.data.data[0],
      });
    } catch (e) {
      setAnalyticsError(e.message || "Failed to fetch analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Analytics" && token) {
      fetchAnalytics();
    }
  }, [activeTab, token]);

  const handleLogOut = async () => {
    try {
      await apiLogout();
      logout();
      navigate("/signin");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    switch (activeTab) {
      case "Dashboard":
        return (
          <DashboardContent
            metrics={dashboardMetrics}
            bookings={bookings}
            onAgentAssignment={handleAgentAssignment}
            agents={agents}
          />
        );
      case "Parcels":
        return (
          <ParcelManagement
            bookings={bookings}
            onAgentAssignment={handleAgentAssignment}
            agents={agents}
            search={search}
            setSearch={setSearch}
            page={page}
            setPage={setPage}
            loading={loading}
          />
        );
      case "Users":
        return <UserManagement token={token} />;
      case "Reports":
        return <Reports token={token} />;
      case "Analytics":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" /> Analytics
            </h1>
            {analyticsLoading && <div>Loading analytics...</div>}
            {analyticsError && (
              <div className="text-red-600">{analyticsError}</div>
            )}
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold mb-2">
                    Today's Summary
                  </h2>
                  <ul className="text-gray-700 space-y-1">
                    <li>
                      Total Bookings:{" "}
                      <b>{analyticsData.daily?.totalBookings ?? "-"}</b>
                    </li>
                    <li>
                      Total Deliveries:{" "}
                      <b>{analyticsData.daily?.totalDeliveries ?? "-"}</b>
                    </li>
                    <li>
                      Failed Deliveries:{" "}
                      <b>{analyticsData.daily?.failedDeliveries ?? "-"}</b>
                    </li>
                    {/* <li>
                      COD Amount:{" "}
                      <b>
                        ${analyticsData.daily?.codData?.totalCODAmount ?? "-"}
                      </b>
                    </li> */}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold mb-2">
                    Revenue (Today)
                  </h2>
                  <ul className="text-gray-700 space-y-1">
                    <li>
                      Total Revenue:{" "}
                      <b>${analyticsData.revenue?.totalRevenue ?? "-"}</b>
                    </li>
                    <li>
                      COD Revenue:{" "}
                      <b>${analyticsData.revenue?.totalCOD ?? "-"}</b>
                    </li>
                    {/* <li>
                      Platform Charges:{" "}
                      <b>${analyticsData.revenue?.platformCharges ?? "-"}</b>
                    </li> */}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">
              Content for {activeTab} coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogOut}
        extraTabs={[{ name: "Analytics", icon: BarChart3 }]}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
