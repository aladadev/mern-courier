import React from "react";
import { Route, Map, Clock } from "lucide-react";

const AgentQuickActions = ({ onShowRouteModal }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={onShowRouteModal}
        className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
      >
        <Route className="w-6 h-6 mr-3" />
        <div className="text-left">
          <p className="font-medium">Optimize Route</p>
          <p className="text-sm opacity-90">Plan your delivery path</p>
        </div>
      </button>
      <button className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
        <Map className="w-6 h-6 mr-3" />
        <div className="text-left">
          <p className="font-medium">Live Navigation</p>
          <p className="text-sm opacity-90">Start GPS guidance</p>
        </div>
      </button>
      <button className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
        <Clock className="w-6 h-6 mr-3" />
        <div className="text-left">
          <p className="font-medium">Time Tracker</p>
          <p className="text-sm opacity-90">Track delivery time</p>
        </div>
      </button>
    </div>
  </div>
);

export default AgentQuickActions;
