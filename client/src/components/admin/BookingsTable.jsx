import React from "react";
import StatusBadge from "../StatusBadge";

const BookingsTable = ({ bookings, onAgentAssignment, agents }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Parcel ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Customer
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Agent
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {bookings.map((booking) => (
          <tr key={booking.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {booking.id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {booking.customer}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <StatusBadge status={booking.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={booking.agentId || ""}
                onChange={(e) => onAgentAssignment(booking.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {agents &&
                  agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.firstName + " " + agent.lastName}
                    </option>
                  ))}
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {booking.amount}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default BookingsTable;
