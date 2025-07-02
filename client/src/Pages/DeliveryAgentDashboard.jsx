import React, { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  User,
  Bell,
  LogOut,
  Filter,
  Search,
  Route,
  Phone,
  ChevronRight,
  Calendar,
  Truck,
  Star,
  AlertCircle,
  Map,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import AgentStats from "../components/agent/AgentStats";
import AgentQuickActions from "../components/agent/AgentQuickActions";
import AgentParcelList from "../components/agent/AgentParcelList";
import AgentRouteModal from "../components/agent/AgentRouteModal";
import {
  getAgentParcels,
  getAgentDashboardMetrics,
  updateParcelStatus as apiUpdateParcelStatus,
  logout as apiLogout,
} from "../api/endpoints";

const DeliveryAgentDashboard = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuthStore();

  const handleLogOut = async () => {
    try {
      await apiLogout();
      logout();
      navigate("/signin");
    } catch {
      toast.error("Something went wrong!");
    }
  };
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    pending: 0,
    active: 0,
    completed: 0,
    failed: 0,
  });

  const [activeTab, setActiveTab] = useState("today");
  const [showRouteModal, setShowRouteModal] = useState(false);

  const priorityColors = {
    high: "bg-gradient-to-r from-red-500 to-red-600",
    medium: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    low: "bg-gradient-to-r from-green-500 to-green-600",
  };

  const statusConfig = {
    assigned: {
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      label: "Ready to Pick",
      icon: Package,
    },
    "picked-up": {
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      label: "Picked Up",
      icon: Clock,
    },
    "in-transit": {
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      label: "In Transit",
      icon: Truck,
    },
    delivered: {
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      label: "Delivered",
      icon: CheckCircle,
    },
    failed: {
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      label: "Failed",
      icon: XCircle,
    },
  };

  // Fetch parcels and metrics
  const fetchParcelsAndMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch parcels
      const res = await getAgentParcels(token, 1, 100);
      const data = res.data.data.parcels || [];

      setParcels(
        data.map((p) => ({
          id: p.trackingId,
          customerName:
            p.customer?.firstName && p.customer?.lastName
              ? p.customer.firstName + " " + p.customer.lastName
              : p.customer?.name || "-",
          address: p.deliveryAddress?.address,
          shortAddress: p.deliveryAddress?.address,
          phone: p.customer?.phone,
          status: p.status?.replace(/-/g, "_") || "assigned",
          priority: p.priority || "medium",
          timeSlot: p.estimatedDeliveryTime
            ? new Date(p.estimatedDeliveryTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          weight: p.weight ? p.weight + " kg" : "-",
          description: p.description || p.parcelType || "-",
          coordinates: p.deliveryAddress?.coordinates,
          paymentMethod: p.isCOD ? "COD" : "Prepaid",
          amount: p.isCOD
            ? p.codAmount
              ? "$" + p.codAmount
              : "$0.00"
            : p.amount
            ? "$" + p.amount
            : "-",
          distance: p.distance ? p.distance + " km" : "-",
          estimatedTime: p.estimatedTime ? p.estimatedTime + " min" : "-",
          customerNotes: p.customerNotes,
        }))
      );
      // Fetch metrics
      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const end = today.toISOString().slice(0, 10);
      const mRes = await getAgentDashboardMetrics(token, start, end);
      const m = mRes.data.data || {};

      console.log("Metrics", m);

      setMetrics({
        pending: m.statusBreakdown?.assigned || 0,
        active:
          (m.statusBreakdown?.["picked-up"] || 0) +
          (m.statusBreakdown?.["in-transit"] || 0),
        completed: m.statusBreakdown?.delivered || 0,
        failed: m.statusBreakdown?.failed || 0,
      });
    } catch (e) {
      setError(e.message || "Failed to fetch data");
      toast.error(e.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcelsAndMetrics();
    // eslint-disable-next-line
  }, [token]);

  // Update status via API
  const handleStatusUpdate = async (parcelId, newStatus) => {
    try {
      setLoading(true);
      await apiUpdateParcelStatus(parcelId, newStatus, undefined, token);
      toast.success("Status updated to " + newStatus);
      await fetchParcelsAndMetrics();
    } catch (e) {
      toast.error(e.message || "Failed to update status");
      setLoading(false);
    }
  };

  const getNextAction = (status) => {
    console.log("Status", status);
    switch (status) {
      case "booked":
        return {
          action: "picked-up",
          label: "Mark as Picked Up",
          color: "bg-yellow-500",
        };
      case "assigned":
        return {
          action: "picked-up",
          label: "Mark as Picked Up",
          color: "bg-yellow-500",
        };
      case "picked_up":
        return {
          action: "in-transit",
          label: "Start Delivery",
          color: "bg-purple-500",
        };
      case "in_transit":
        return {
          action: "delivered",
          label: "Mark as Delivered",
          color: "bg-green-500",
        };
      default:
        return null;
    }
  };

  const todaysParcels = parcels.filter(
    (p) => p.status !== "delivered" && p.status !== "failed"
  );
  const completedParcels = parcels.filter(
    (p) => p.status === "delivered" || p.status === "failed"
  );

  const stats = metrics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Delivery Hub
                  </h1>
                  <p className="text-sm text-gray-500">Agent Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">DA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Agent #001
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <div>
                  <button
                    onClick={handleLogOut}
                    className="px-2 py-1 bg-red-300 text-white rounded cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <AgentStats stats={stats} />
        {/* Quick Actions */}
        <AgentQuickActions onShowRouteModal={() => setShowRouteModal(true)} />
        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-8 text-lg text-gray-500">
            Loading...
          </div>
        )}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("today")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "today"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Today's Deliveries ({todaysParcels.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "completed"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed ({completedParcels.length})
              </button>
            </nav>
          </div>
          {/* Parcel Cards */}
          <div className="p-6">
            {activeTab === "today" ? (
              <AgentParcelList
                parcels={todaysParcels}
                onStatusUpdate={handleStatusUpdate}
                priorityColors={priorityColors}
                statusConfig={statusConfig}
                getNextAction={getNextAction}
                type="today"
              />
            ) : (
              <AgentParcelList
                parcels={completedParcels}
                onStatusUpdate={handleStatusUpdate}
                priorityColors={priorityColors}
                statusConfig={statusConfig}
                getNextAction={getNextAction}
                type="completed"
              />
            )}
          </div>
        </div>
      </div>

      <AgentRouteModal
        open={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        parcels={todaysParcels}
        priorityColors={priorityColors}
      />
    </div>
  );
};

export default DeliveryAgentDashboard;
