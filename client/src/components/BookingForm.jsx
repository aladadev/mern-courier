import React, { useMemo } from "react";
import { Package, MapPin, CreditCard, DollarSign, Plus } from "lucide-react";
import FormField from "./FormField";
import toast from "react-hot-toast";
import { bookParcel } from "../api/endpoints";

const PARCEL_SIZES = [
  { value: "small", label: "Small (up to 2kg)", price: 5.99 },
  { value: "medium", label: "Medium (2-10kg)", price: 12.99 },
  { value: "large", label: "Large (10-25kg)", price: 24.99 },
];
const PARCEL_TYPES = ["document", "box", "fragile", "other"];

const calculateEstimatedPrice = (size) => {
  const sizeConfig = PARCEL_SIZES.find((s) => s.value === size);
  return sizeConfig ? sizeConfig.price : 0;
};

const BookingForm = ({
  onBookingSuccess,
  useFormValidation,
  getCoordinatesFromAddress,
  token,
}) => {
  const validationRules = {
    pickupAddress: { required: true, label: "Pickup Address", minLength: 10 },
    deliveryAddress: {
      required: true,
      label: "Delivery Address",
      minLength: 10,
    },
    parcelSize: { required: true, label: "Parcel Size" },
    parcelType: { required: true, label: "Parcel Type" },
    paymentMethod: { required: true, label: "Payment Method" },
    codAmount: {
      required: false,
      label: "COD Amount",
      pattern: /^\d+\.?\d{0,2}$/,
      message: "Please enter a valid amount",
    },
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateAll,
    resetForm,
  } = useFormValidation(
    {
      pickupAddress: "",
      deliveryAddress: "",
      parcelSize: "small",
      parcelType: "document",
      paymentMethod: "prepaid",
      codAmount: "",
      specialInstructions: "",
    },
    validationRules
  );

  const estimatedPrice = useMemo(
    () => calculateEstimatedPrice(values.parcelSize),
    [values.parcelSize]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pickupAddressCoords = await getCoordinatesFromAddress(
      values?.pickupAddress
    );
    const deliveryAddress = await getCoordinatesFromAddress(
      values?.deliveryAddress
    );
    const parcelBookingData = {
      pickupAddress: {
        address: values?.pickupAddress,
        coordinates: pickupAddressCoords,
      },
      deliveryAddress: {
        address: values?.deliveryAddress,
        coordinates: deliveryAddress,
      },
      parcelType: values?.parcelType,
      size: values?.parcelSize,
      isCOD: values?.paymentMethod !== "prepaid",
      platformCharge: estimatedPrice,
      codAmount: parseFloat(values?.codAmount),
    };

    console.log("PArcel booking,", parcelBookingData);
    if (!validateAll()) {
      toast.error("Validation error");
      return;
    }
    try {
      const { data } = await bookParcel(parcelBookingData, token);
      onBookingSuccess(data.data.parcel);
      resetForm();
      toast.success("Booking!!");
    } catch (err) {
      toast.error("Booking failed!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">Book a Pickup</h2>
              <p className="text-emerald-100">
                Schedule your parcel delivery with ease
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Address Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <FormField
              label="Pickup Address"
              name="pickupAddress"
              value={values.pickupAddress}
              onChange={setValue}
              onBlur={setTouched}
              error={errors.pickupAddress}
              touched={touched.pickupAddress}
              required
              placeholder="Enter complete pickup address..."
            >
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-emerald-500 w-5 h-5 pointer-events-none" />
                <textarea
                  name="pickupAddress"
                  value={values.pickupAddress}
                  onChange={(e) => setValue("pickupAddress", e.target.value)}
                  onBlur={() => setTouched("pickupAddress")}
                  placeholder="Enter complete pickup address..."
                  rows="3"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none ${
                    touched.pickupAddress && errors.pickupAddress
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                  }`}
                />
              </div>
            </FormField>
            <FormField
              label="Delivery Address"
              name="deliveryAddress"
              value={values.deliveryAddress}
              onChange={setValue}
              onBlur={setTouched}
              error={errors.deliveryAddress}
              touched={touched.deliveryAddress}
              required
              placeholder="Enter complete delivery address..."
            >
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-emerald-500 w-5 h-5 pointer-events-none" />
                <textarea
                  name="deliveryAddress"
                  value={values.deliveryAddress}
                  onChange={(e) => setValue("deliveryAddress", e.target.value)}
                  onBlur={() => setTouched("deliveryAddress")}
                  placeholder="Enter complete delivery address..."
                  rows="3"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none ${
                    touched.deliveryAddress && errors.deliveryAddress
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                  }`}
                />
              </div>
            </FormField>
          </div>
          {/* Parcel Details Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <FormField
              label="Parcel Size"
              name="parcelSize"
              value={values.parcelSize}
              onChange={setValue}
              onBlur={setTouched}
              error={errors.parcelSize}
              touched={touched.parcelSize}
              required
              icon={Package}
            >
              <select
                name="parcelSize"
                value={values.parcelSize}
                onChange={(e) => setValue("parcelSize", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {PARCEL_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label} - {`$${size.price.toFixed(2)}`}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Parcel Type"
              name="parcelType"
              value={values.parcelType}
              onChange={setValue}
              onBlur={setTouched}
              error={errors.parcelType}
              touched={touched.parcelType}
              required
              icon={Package}
            >
              <select
                name="parcelType"
                value={values.parcelType}
                onChange={(e) => setValue("parcelType", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {PARCEL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          {/* Payment Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
              Payment Options
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  values.paymentMethod === "prepaid"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="prepaid"
                  checked={values.paymentMethod === "prepaid"}
                  onChange={(e) => setValue("paymentMethod", e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.paymentMethod === "prepaid"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {values.paymentMethod === "prepaid" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <CreditCard className="w-5 h-5 ml-3 mr-2 text-emerald-600" />
                  <span className="font-medium">Prepaid</span>
                </div>
              </label>
              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  values.paymentMethod === "cod"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={values.paymentMethod === "cod"}
                  onChange={(e) => setValue("paymentMethod", e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      values.paymentMethod === "cod"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {values.paymentMethod === "cod" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <DollarSign className="w-5 h-5 ml-3 mr-2 text-emerald-600" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
              </label>
            </div>
            {values.paymentMethod === "cod" && (
              <FormField
                label="COD Amount"
                name="codAmount"
                type="number"
                value={values.codAmount}
                onChange={setValue}
                onBlur={setTouched}
                error={errors.codAmount}
                touched={touched.codAmount}
                placeholder="0.00"
                icon={DollarSign}
                className="max-w-md"
              />
            )}
          </div>
          {/* Special Instructions */}
          <FormField
            label="Special Instructions"
            name="specialInstructions"
            value={values.specialInstructions}
            onChange={setValue}
            onBlur={setTouched}
            placeholder="Any special handling instructions (optional)..."
          >
            <textarea
              name="specialInstructions"
              value={values.specialInstructions}
              onChange={(e) => setValue("specialInstructions", e.target.value)}
              placeholder="Any special handling instructions (optional)..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </FormField>
          {/* Price Summary & Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estimatedPrice.toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Pickup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
