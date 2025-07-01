import React from "react";
import {
  LayoutDashboard,
  CheckCircle,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Package,
  FileText,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Parcels", icon: Package, badge: null },
    { name: "Users", icon: Users },
    { name: "Analytics", icon: BarChart3 },
    { name: "Reports", icon: FileText },
  ];
  const generalItems = [
    { name: "Settings", icon: Settings },
    { name: "Help", icon: HelpCircle },
    { name: "Logout", icon: LogOut },
  ];
  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.name;
    const handleClick = () => {
      if (item.name === "Logout") {
        onLogout && onLogout();
      } else {
        setActiveTab(item.name);
      }
    };
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{item.name}</span>
        {item.badge && (
          <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };
  return (
    <div className="w-40 sm:w-60 bg-gray-50 flex flex-col border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">Donezo</span>
        </div>
      </div>
      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
            MENU
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.name} item={item} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
            GENERAL
          </h3>
          <div className="space-y-1">
            {generalItems.map((item) => (
              <MenuItem key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
