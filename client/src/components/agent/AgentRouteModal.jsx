import React from "react";
import { XCircle } from "lucide-react";

const AgentRouteModal = ({ open, onClose, parcels, priorityColors }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Optimized Route
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Route optimized by priority and distance • {parcels.length} stops
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {parcels.map((parcel, index) => (
              <div
                key={parcel.id}
                className="flex items-center p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {parcel.customerName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {parcel.shortAddress}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            priorityColors[parcel.priority]
                          }`}
                        ></span>
                        <span className="text-xs text-gray-500">
                          {parcel.priority} priority
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {parcel.timeSlot}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {parcel.distance}
                      </p>
                      <p className="text-xs text-gray-500">
                        {parcel.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => {
                const addresses = parcels.map((p) => p.address).join(" to ");
                window.open(
                  `https://maps.google.com/maps/dir/${encodeURIComponent(
                    addresses
                  )}`,
                  "_blank"
                );
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Start Navigation
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRouteModal;
