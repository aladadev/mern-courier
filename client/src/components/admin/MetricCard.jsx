import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const MetricCard = ({ title, value, change, trend, icon: Icon }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={`text-sm ml-1 ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      <div className="bg-emerald-100 p-3 rounded-full">
        {Icon && <Icon className="w-6 h-6 text-emerald-600" />}
      </div>
    </div>
  </div>
);
export default MetricCard;
