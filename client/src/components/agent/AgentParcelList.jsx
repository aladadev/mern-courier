import React from "react";
import {
  Package,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
} from "lucide-react";

const AgentParcelList = ({
  parcels = [],
  onStatusUpdate,
  priorityColors,
  statusConfig,
  getNextAction,
  type = "today",
}) => {
  if (type === "today") {
    return (
      <div className="space-y-4">
        {parcels.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No deliveries for today</p>
          </div>
        ) : (
          parcels.map((parcel) => {
            const status = statusConfig[parcel.status];
            const nextAction = getNextAction(parcel.status);
            const IconComponent = status?.icon || Package;
            const statusLabel =
              status?.label ||
              (parcel.status
                ? parcel.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : "Unknown");
            const statusTextColor = status?.textColor || "text-gray-400";
            const statusBgColor = status?.bgColor || "bg-gray-100";

            console.log("parcel", parcel);
            return (
              <div
                key={parcel.id}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 ${statusBgColor} rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${statusTextColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {parcel.customerName}
                        </h3>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            priorityColors[parcel.priority]
                          }`}
                        ></div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${statusTextColor} ${statusBgColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {parcel.shortAddress}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {parcel.timeSlot}
                        </span>
                        <span className="flex items-center">
                          <Navigation className="w-4 h-4 mr-1" />
                          {parcel.distance} • {parcel.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          {parcel.description}
                        </span>
                        <span className="font-medium text-gray-900">
                          {parcel.amount}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            parcel.paymentMethod === "COD"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {parcel.paymentMethod}
                        </span>
                      </div>
                      {parcel.customerNotes && (
                        <div className="mt-2 flex items-center space-x-1 text-sm text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>{parcel.customerNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        window.open(`tel:${parcel.phone}`, "_self")
                      }
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://maps.google.com/maps?q=${encodeURIComponent(
                            parcel.address
                          )}`,
                          "_blank"
                        )
                      }
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Navigate
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    {parcel.status === "in-transit" && (
                      <button
                        onClick={() => onStatusUpdate(parcel.id, "failed")}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200"
                      >
                        Mark Failed
                      </button>
                    )}
                    {nextAction && (
                      <button
                        onClick={() =>
                          onStatusUpdate(parcel.id, nextAction.action)
                        }
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all duration-200 ${nextAction.color}`}
                      >
                        {nextAction.label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }
  // Completed tab
  return (
    <div className="space-y-4">
      {parcels.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No completed deliveries yet</p>
        </div>
      ) : (
        parcels.map((parcel) => {
          const status = statusConfig[parcel.status];
          const IconComponent = status?.icon || Package;
          const statusLabel =
            status?.label ||
            (parcel.status
              ? parcel.status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : "Unknown");
          const statusTextColor = status?.textColor || "text-gray-400";
          const statusBgColor = status?.bgColor || "bg-gray-100";
          return (
            <div key={parcel.id} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 ${statusBgColor} rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent className={`w-5 h-5 ${statusTextColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {parcel.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {parcel.shortAddress}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${statusTextColor} ${statusBgColor}`}
                  >
                    {statusLabel}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{parcel.amount}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AgentParcelList;
