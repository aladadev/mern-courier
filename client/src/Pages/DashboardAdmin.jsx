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
    activeUsers: { value: 0, change: "0%", trend: "up" },
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getDashboardMetrics(
          token,
          "2024-01-01",
          "2024-12-31"
        );
        setDashboardMetrics({
          dailyBookings: {
            value: res.data.data.dailyBookings || 0,
            change: "+12%",
            trend: "up",
          },
          failedDeliveries: {
            value: res.data.data.failedDeliveries || 0,
            change: "-5%",
            trend: "down",
          },
          codAmounts: {
            value: `$${res.data.data.codAmounts || 0}`,
            change: "+8%",
            trend: "up",
          },
          activeUsers: {
            value: res.data.data.activeUsers || 0,
            change: "+15%",
            trend: "up",
          },
        });
      } catch {
        // fallback to default
      }
    };
    if (token) fetchMetrics();
  }, [token]);

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
      />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
