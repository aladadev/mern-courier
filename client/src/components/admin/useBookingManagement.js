import { useState, useEffect } from "react";
import {
  getAllAgents,
  assignAgentToParcel,
  getCustomerParcels,
} from "../../api/endpoints";
import toast from "react-hot-toast";

const getDisplayName = (user) => {
  if (!user) return "Unknown";
  if (user.firstName || user.lastName)
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "Unknown";
};

const useBookingManagement = (token) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchParcels = async (token, page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const parcelsRes = await getCustomerParcels(token, page, 20);
      setBookings(
        parcelsRes.data.data.parcels
          .filter((p) =>
            search
              ? p.trackingId.includes(search) ||
                getDisplayName(p.customer)
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : true
          )
          .map((p) => ({
            id: p.trackingId,
            customer: getDisplayName(p.customer),
            status: p.status,
            agent: getDisplayName(p.agent),
            agentId: p.agent?._id || "",
            amount: `$${p.platformCharge}`,
          }))
      );
    } catch (e) {
      setError(e.message || "Failed to fetch parcels");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async (token) => {
    try {
      const agentsRes = await getAllAgents(token);
      // Only include users with role 'agent'
      setAgents(
        (agentsRes.data.data.agents || []).filter((a) => a.role === "agent")
      );
    } catch (e) {
      setError(e.message || "Failed to fetch agents");
    }
  };

  useEffect(() => {
    if (token) {
      fetchParcels(token, page, search);
      fetchAgents(token);
    }
  }, [token, page, search]);

  const handleAgentAssignment = async (bookingId, agentId) => {
    try {
      const agent = agents.find((a) => a._id === agentId);
      await assignAgentToParcel(bookingId, agentId, token);
      toast.success("Agent assigned successfully");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                agent: agent ? getDisplayName(agent) : "Unassigned",
                agentId,
              }
            : b
        )
      );
    } catch (e) {
      toast.error(e.message || "Failed to assign agent");
    }
  };

  return {
    bookings,
    handleAgentAssignment,
    loading,
    error,
    agents,
    page,
    setPage,
    search,
    setSearch,
    refetch: () => fetchParcels(token, page, search),
  };
};
export default useBookingManagement;
