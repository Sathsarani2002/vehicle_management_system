import { createBrowserRouter, Navigate, useParams } from "react-router";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BookingManagement from "./pages/BookingManagement";
import ServiceManagement from "./pages/ServiceManagement";
import UserManagement from "./pages/UserManagement";
import BookingConfirmation from "./pages/BookingConfirmation";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function RedirectLegacyBookingConfirmation() {
  const { id } = useParams();
  return <Navigate to={`/website/booking-confirmation/${id}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/website" replace />,
  },
  {
    path: "/website",
    Component: Home,
  },
  {
    path: "/website/booking-confirmation/:id",
    Component: BookingConfirmation,
  },
  {
    path: "/website/login",
    Component: CustomerLogin,
  },
  {
    path: "/website/register",
    Component: CustomerRegister,
  },
  {
    path: "/booking-confirmation/:id",
    Component: RedirectLegacyBookingConfirmation,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        Component: () => (
          <ProtectedRoute>
            <BookingManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "services",
        Component: () => (
          <ProtectedRoute>
            <ServiceManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        Component: () => (
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
