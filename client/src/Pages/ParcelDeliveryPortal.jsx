import React, { useState, useCallback, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { getCustomerParcels, logout as apiLogout } from "../api/endpoints";
import BookingForm from "../components/BookingForm";
import BookingHistory from "../components/BookingHistory";
import TrackingMap from "../components/TrackingMap";
import { getCoordinatesFromAddress } from "../utils/geocode";
import useFormValidation from "../utils/useFormValidation";

const ParcelDeliveryPortal = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const { logout, token } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomerParcels(token);
        if (res.data.success) {
          setBookings(res.data.data.parcels);
        } else {
          throw new Error("Something went wrong");
        }
      } catch (err) {
        toast.error("Something went wrong!");
      }
    })();
  }, [token]);

  const handleLogOut = async () => {
    try {
      await apiLogout();
      logout();
      navigate("/signin");
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  const handleBookingSuccess = useCallback((newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveTab("history");
    toast.success(`Booking confirmed! Tracking ID: ${newBooking.id}`);
  }, []);

  const handleTrackParcel = useCallback((booking) => {
    setSelectedBooking(booking);
    setActiveTab("track");
  }, []);

  const navigationTabs = [
    {
      id: "book",
      label: "Book Pickup",
      description: "Schedule a new pickup",
    },
    {
      id: "history",
      label: "My Bookings",
      description: "View booking history",
    },
    {
      id: "track",
      label: "Track Parcel",
      description: "Real-time tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                {/* Logo Icon */}
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  QuickDeliver
                </h1>
                <p className="text-xs text-gray-500">Enterprise Logistics</p>
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  
                  <p className="text-xs text-gray-500">Premium Member</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                  {/* User Icon */}
                </div>
                <div>
                  <button
                    onClick={handleLogOut}
                    className="px-2 py-1 bg-red-500 text-white rounded cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationTabs.map(({ id, label, description }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="text-left">
                  <div>{label}</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                    {description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "book" && (
          <BookingForm
            onBookingSuccess={handleBookingSuccess}
            useFormValidation={useFormValidation}
            getCoordinatesFromAddress={getCoordinatesFromAddress}
            token={token}
          />
        )}
        {activeTab === "history" && (
          <BookingHistory
            bookings={bookings}
            onTrackParcel={handleTrackParcel}
          />
        )}
        {activeTab === "track" && (
          <TrackingMap
            selectedBooking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 QuickDeliver Enterprise. All rights reserved.</p>
            <p className="mt-1">
              Reliable logistics solutions for modern businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ParcelDeliveryPortal;
