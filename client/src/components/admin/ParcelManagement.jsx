import React from "react";
import BookingsTable from "./BookingsTable";
import { Download, Search, Filter } from "lucide-react";

const ParcelManagement = ({
  bookings,
  onAgentAssignment,
  agents,
  search,
  setSearch,
  page,
  setPage,
  loading,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parcel Management</h1>
        <p className="text-gray-600">
          Assign agents and manage parcel deliveries
        </p>
      </div>
      <div className="flex gap-3">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <Download size={16} /> Export
        </button>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">All Parcels</h2>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parcels..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={16} />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-6">Loading parcels...</div>
      ) : (
        <BookingsTable
          bookings={bookings}
          onAgentAssignment={onAgentAssignment}
          agents={agents}
        />
      )}
      <div className="flex justify-end p-4 gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  </div>
);
export default ParcelManagement;
