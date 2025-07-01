import React from "react";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";

const AgentStats = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Truck className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
          <p className="text-sm text-gray-500">Failed</p>
        </div>
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
      </div>
    </div>
  </div>
);

export default AgentStats;
