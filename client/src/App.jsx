import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router";
import useAuthStore from "./store/useAuthStore";
import { getCurrentUser } from "./api/endpoints";

function App() {
  const { setUser, setToken, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setChecking(true);
      try {
        const res = await getCurrentUser();

        const user = res.data.data?.user;
        const token = res.data.data?.accessToken;
        if (user) {
          setUser(user);
          setToken(token);
          // Navigate based on role
          if (user.role === "admin") navigate("/dashboard", { replace: true });
          else if (user.role === "agent")
            navigate("/dashboard", { replace: true });
          else if (user.role === "customer")
            navigate("/dashboard", { replace: true });
          else navigate("/", { replace: true });
        } else {
          logout();
          navigate("/signin", { replace: true });
        }
      } catch {
        logout();
        navigate("/signin", { replace: true });
      } finally {
        setChecking(false);
      }
    };
    checkSession();
    // eslint-disable-next-line
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Checking session...
      </div>
    );
  }

  // Render router outlet (children)
  return <Outlet />;
}

export default App;
