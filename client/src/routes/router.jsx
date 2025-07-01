import { createBrowserRouter } from "react-router";
import App from "../App";
import SignInForm from "../auth/SignInForm";
import SignUpForm from "../auth/SignUpForm";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        ),
      },
      {
        path: "signin",
        element: <SignInForm />,
      },
      {
        path: "signup",
        element: <SignUpForm />,
      },
    ],
  },
]);
