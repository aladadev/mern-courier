import React, { useEffect, useState } from "react";
import { MapPin, Truck, Calendar, Navigation, Clock, Plus } from "lucide-react";
import StatusBadge from "./StatusBadge";
import {
  getParcelByTrackingId,
  getParcelTrackingHistory,
} from "../api/endpoints";

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const TrackingMap = ({ selectedBooking, onClose }) => {
  const [parcel, setParcel] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedBooking) return;
    const fetchTrackingData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use trackingId from selectedBooking
        const trackingId = selectedBooking.trackingId || selectedBooking.id;
        const [parcelRes, historyRes] = await Promise.all([
          getParcelByTrackingId(trackingId),
          getParcelTrackingHistory(trackingId),
        ]);
        setParcel(parcelRes.data.data.parcel);
        setHistory(historyRes.data.data.history);
      } catch (e) {
        setError(e.message || "Failed to fetch tracking data");
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingData();
  }, [selectedBooking]);

  if (!selectedBooking) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Parcel to Track
          </h3>
          <p className="text-gray-600">
            Choose a booking from your history to view real-time tracking
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading tracking data...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }
  if (!parcel) {
    return <div className="text-center py-12">No tracking data found.</div>;
  }

  // Compose the timeline from history (sorted by timestamp ascending)
  const timeline = [...history].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const currentStatus =
    timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const progress = timeline.length ? (timeline.length / 6) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  Real-time Tracking
                </h2>
                <p className="text-blue-100">Parcel #{parcel.trackingId}</p>
              </div>
            </div>
            <StatusBadge
              status={parcel.status}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
        <div className="p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Status */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Current Status
                </h3>
                <p className="text-emerald-700 font-medium capitalize mb-2">
                  {parcel.status.replace("-", " ")}
                </p>
                <p className="text-sm text-gray-600">
                  {currentStatus?.location?.lat && currentStatus?.location?.lng
                    ? `Lat: ${currentStatus.location.lat}, Lng: ${currentStatus.location.lng}`
                    : currentStatus?.location || "No location info"}
                </p>
              </div>
              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Package Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {parcel.parcelType}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Size</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {parcel.size}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Payment</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {parcel.isCOD ? "COD" : "Prepaid"}
                  </span>
                </div>
                {parcel.status !== "delivered" && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">
                      Estimated Delivery
                    </span>
                    <span className="text-sm font-medium text-blue-900">
                      {parcel.estimatedDeliveryTime
                        ? formatDate(parcel.estimatedDeliveryTime)
                        : "Today, 4:30 PM"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Map Area */}
            <div className="lg:col-span-2">
              <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl h-80 flex items-center justify-center border border-gray-200">
                {/* Simulated Map Interface */}
                <div className="absolute inset-4 bg-white rounded-lg shadow-inner overflow-hidden">
                  <div className="h-full relative bg-gradient-to-br from-green-100 to-blue-100">
                    {/* Route Line */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient
                          id="routeGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 50 50 Q 150 100 250 80 T 350 120"
                        stroke="url(#routeGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="8,4"
                        className="animate-pulse"
                      />
                    </svg>
                    {/* Location Markers */}
                    <div className="absolute top-12 left-12 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="absolute top-24 right-20 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute bottom-16 right-12 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                    {/* Truck Icon */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Map Controls */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center hover:bg-gray-50">
                    <span className="text-gray-600 text-sm">−</span>
                  </button>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Delivery Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Address Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
            Pickup Location
          </h3>
          <p className="text-gray-700">{parcel.pickupAddress?.address}</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Picked up:{" "}
            {parcel.pickedUpAt ? formatDate(parcel.pickedUpAt) : "N/A"}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Navigation className="w-5 h-5 text-blue-600 mr-2" />
            Delivery Location
          </h3>
          <p className="text-gray-700">{parcel.deliveryAddress?.address}</p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {parcel.deliveredAt ? (
              <span className="text-green-600 font-medium">
                Delivered: {formatDate(parcel.deliveredAt)}
              </span>
            ) : (
              <span>
                Estimated:{" "}
                {parcel.estimatedDeliveryTime
                  ? formatDate(parcel.estimatedDeliveryTime)
                  : "Today, 4:30 PM"}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Tracking Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 text-emerald-600 mr-2" />
            Tracking Timeline
          </h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {timeline.map((event, index) => {
                const isLast = index === timeline.length - 1;
                const isCurrent = isLast && parcel.status !== "delivered";
                return (
                  <li key={index}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              isCurrent
                                ? "bg-emerald-500 animate-pulse"
                                : event.status === "delivered"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {StatusBadge.STATUS_CONFIG?.[event.status]?.icon &&
                              React.createElement(
                                StatusBadge.STATUS_CONFIG[event.status].icon,
                                {
                                  className: "h-4 w-4 text-white",
                                }
                              )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {event.status.replace("-", " ")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {event.location?.lat && event.location?.lng
                                ? `Lat: ${event.location.lat}, Lng: ${event.location.lng}`
                                : event.location || "No location info"}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
