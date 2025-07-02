import React from "react";
import MetricCard from "./MetricCard";
import BookingsTable from "./BookingsTable";
import { Package, AlertCircle, DollarSign, Users } from "lucide-react";

const DashboardContent = ({ metrics, bookings, onAgentAssignment, agents }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">
        Welcome back! Here's what's happening today.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Bookings"
        value={metrics.dailyBookings.value}
        change={metrics.dailyBookings.change}
        trend={metrics.dailyBookings.trend}
        icon={Package}
      />
      <MetricCard
        title="Failed Deliveries"
        value={metrics.failedDeliveries.value}
        change={metrics.failedDeliveries.change}
        trend={metrics.failedDeliveries.trend}
        icon={AlertCircle}
      />
      <MetricCard
        title="COD Amount"
        value={metrics.codAmounts.value}
        change={metrics.codAmounts.change}
        trend={metrics.codAmounts.trend}
        icon={DollarSign}
      />
      <MetricCard
        title="Total Deliveries"
        value={metrics.totalDeliveries.value}
        change={metrics.totalDeliveries.change}
        trend={metrics.totalDeliveries.trend}
        icon={Package}
      />
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
      </div>
      <BookingsTable
        bookings={bookings}
        onAgentAssignment={onAgentAssignment}
        agents={agents}
      />
    </div>
  </div>
);
export default DashboardContent;
