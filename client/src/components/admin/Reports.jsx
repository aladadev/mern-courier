import React, { useState } from "react";
import { Package, Users, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { exportUsers, generateDeliveryReport } from "../../api/endpoints";

const Reports = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async (type, format = "csv") => {
    setLoading(true);
    setError(null);
    try {
      if (type === "users") {
        await exportUsers(token, format);
      } else if (type === "daily") {
        await generateDeliveryReport(
          token,
          "daily",
          "2024-01-01",
          "2024-12-31",
          format
        );
      } else if (type === "financial") {
        await generateDeliveryReport(
          token,
          "financial",
          "2024-01-01",
          "2024-12-31",
          format
        );
      }
      toast.success("Report exported successfully");
    } catch (e) {
      const msg = e && e.message ? e.message : "Failed to export report";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export various reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Daily Report
            </h3>
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Daily bookings, deliveries, and revenue summary
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              onClick={() => handleExport("daily", "csv")}
              disabled={loading}
            >
              Export CSV
            </button>
            <button
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              onClick={() => handleExport("daily", "pdf")}
              disabled={loading}
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Report</h3>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            User registration and activity analysis
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              onClick={() => handleExport("users", "csv")}
              disabled={loading}
            >
              Export CSV
            </button>
            <button
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              onClick={() => handleExport("users", "pdf")}
              disabled={loading}
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Report
            </h3>
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            COD amounts, revenue, and payment analytics
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              onClick={() => handleExport("financial", "csv")}
              disabled={loading}
            >
              Export CSV
            </button>
            <button
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              onClick={() => handleExport("financial", "pdf")}
              disabled={loading}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
      {loading && <div>Exporting report...</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};
export default Reports;
