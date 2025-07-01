import axios from "./axiosInstance";
import useAuthStore from "../store/useAuthStore";

// Auth
export const login = (data) => axios.post("/users/login", data);
export const logout = () => axios.post("/users/logout");
export const register = (data) => axios.post("/users/register", data);
export const getCurrentUser = () =>
  axios.get("/users/me", { withCredentials: true });
export const refreshToken = () => axios.post("/users/refresh");

// Helper: login and fetch user
export const loginAndFetchUser = async (loginData) => {
  await login(loginData); // sets cookie
  const res = await getCurrentUser();
  const user = res.data.data?.user;
  const token = res.data.data?.accessToken;
  const { login: setLogin } = useAuthStore.getState();
  setLogin(user, token);
  return { user, token };
};

// Customer Operations
export const bookParcel = (data, token) =>
  axios.post("/parcels/pickup", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCustomerParcels = (token, page = 1, limit = 10) =>
  axios.get(`/parcels?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const cancelParcel = (trackingId, reason, token) =>
  axios.patch(
    `/parcels/${trackingId}/cancel`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );

// Agent Operations
export const getAgentParcels = (token, page = 1, limit = 10) =>
  axios.get(`/parcels?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateParcelStatus = (trackingId, status, location, token) =>
  axios.patch(
    `/parcels/${trackingId}/status`,
    { status, location },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const updateParcelLocation = (trackingId, lat, lng, token) =>
  axios.patch(
    `/parcels/${trackingId}/location`,
    { lat, lng },
    { headers: { Authorization: `Bearer ${token}` } }
  );

// Public Operations
export const getParcelByTrackingId = (trackingId) =>
  axios.get(`/parcels/track/${trackingId}`);
export const getParcelTrackingHistory = (trackingId) =>
  axios.get(`/parcels/track/${trackingId}/history`);

// Admin Operations
export const assignAgentToParcel = (trackingId, agentId, token) =>
  axios.patch(
    `/admin/parcels/${trackingId}/assign-agent`,
    { agentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const bulkAssignAgents = (assignments, token) =>
  axios.post(
    "/admin/parcels/bulk-assign",
    { assignments },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const getUnassignedParcels = (token, page = 1, limit = 10) =>
  axios.get(`/admin/parcels/unassigned?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAllUsers = (token, page = 1, limit = 10, role = "customer") =>
  axios.get(`/admin/users?page=${page}&limit=${limit}&role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getUserById = (userId, token) =>
  axios.get(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateUserRole = (userId, role, token) =>
  axios.patch(
    `/admin/users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const getAllAgents = (token, page = 1, limit = 10) =>
  axios.get(`/admin/agents?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSystemStats = (token) =>
  axios.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
export const exportUsers = (token, format = "csv", role = "customer") =>
  axios.get(`/admin/export/users?format=${format}&role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getBookingHistoryAdmin = (token, parcelId, userId, status) =>
  axios.get(
    `/admin/booking-history?parcelId=${parcelId}&userId=${userId}&status=${status}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

// Analytics & Reports
export const getDashboardMetrics = (token, startDate, endDate) =>
  axios.get(`/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getDailyAnalytics = (token, date) =>
  axios.get(`/analytics/daily/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAgentPerformance = (token, startDate, endDate) =>
  axios.get(
    `/analytics/agent-performance?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const generateDeliveryReport = (
  token,
  reportType,
  startDate,
  endDate,
  format = "json"
) =>
  axios.get(
    `/analytics/reports?reportType=${reportType}&startDate=${startDate}&endDate=${endDate}&format=${format}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const getRevenueAnalytics = (
  token,
  startDate,
  endDate,
  groupBy = "daily"
) =>
  axios.get(
    `/analytics/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const getDeliveryAnalytics = (token, startDate, endDate) =>
  axios.get(`/analytics/delivery?startDate=${startDate}&endDate=${endDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Agent Analytics
export const getAgentDashboardMetrics = (token, startDate, endDate) =>
  axios.get(
    `/analytics/agent/dashboard?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const getAgentDailyAnalytics = (token, date) =>
  axios.get(`/analytics/agent/daily/${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAgentOwnPerformance = (token, startDate, endDate) =>
  axios.get(
    `/analytics/agent/performance?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
