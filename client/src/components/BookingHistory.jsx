import React, { useState, useMemo } from "react";
import {
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Eye,
  TrendingUp,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const BookingHistory = ({ bookings, onTrackParcel }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickupAddress.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.deliveryAddress.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const delivered = bookings.filter((b) => b.status === "delivered").length;
    const pending = bookings.filter((b) =>
      ["pending", "picked-up", "in-transit", "out-for-delivery"].includes(
        b.status
      )
    ).length;
    const totalSpent = bookings.reduce(
      (sum, b) => sum + (b.platformCharge + (b.codAmount || 0)),
      0
    );

    return { total, delivered, pending, totalSpent };
  }, [bookings]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: Package,
            color: "emerald",
          },
          {
            label: "Delivered",
            value: stats.delivered,
            icon: CheckCircle,
            color: "green",
          },
          {
            label: "In Progress",
            value: stats.pending,
            icon: Clock,
            color: "blue",
          },
          {
            label: "Total Spent",
            value: formatCurrency(stats.totalSpent),
            icon: DollarSign,
            color: "purple",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div
                className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 text-emerald-600 mr-3" />
                Booking History
              </h2>
              <p className="text-gray-600 mt-1">
                Track and manage all your parcel deliveries
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="picked-up">Picked Up</option>
                <option value="in-transit">In Transit</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>
        {/* Bookings List */}
        <div className="divide-y divide-gray-100">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={booking.status} />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        #{booking.trackingId}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking?.codAmount || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.isCOD ? "COD" : "Prepaid"}
                      </p>
                    </div>
                    <button
                      onClick={() => onTrackParcel(booking)}
                      className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200 font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Track
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      From
                    </p>
                    <p className="text-sm text-gray-900">
                      {booking.pickupAddress.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      To
                    </p>
                    <p className="text-sm text-gray-900">
                      {booking.deliveryAddress.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {booking.parcelType}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {booking.size}
                    </span>
                    {booking.paymentMethod === "cod" && booking.codAmount && (
                      <span className="flex items-center text-amber-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        COD: {formatCurrency(booking?.codAmount || 0)}
                      </span>
                    )}
                  </div>
                  {booking.deliveredAt && (
                    <span className="text-green-600 font-medium">
                      Delivered: {formatDate(booking.deliveredAt)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
