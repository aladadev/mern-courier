import React from "react";
import { AlertCircle } from "lucide-react";

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder = "",
  icon: Icon,
  children,
  className = "",
}) => {
  const hasError = touched && error;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}

        {children || (
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            onBlur={() => onBlur(name)}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              ${Icon ? "pl-12" : ""}
              ${
                hasError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
              }
            `}
          />
        )}
      </div>

      {hasError && (
        <p className="text-xs text-red-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
