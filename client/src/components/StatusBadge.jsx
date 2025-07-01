import React from "react";
import {
  Clock,
  Package,
  Truck,
  Navigation,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: Clock,
  },
  "picked-up": {
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: Package,
  },
  "in-transit": {
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  "out-for-delivery": {
    color: "text-purple-700 bg-purple-50 border-purple-200",
    icon: Navigation,
  },
  delivered: {
    color: "text-green-700 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    color: "text-red-700 bg-red-50 border-red-200",
    icon: AlertCircle,
  },
};

const StatusBadge = ({ status, className = "" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </div>
  );
};

export default StatusBadge;
