import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Register from "./auth/pages/Register";
import Logout from "./auth/pages/Logout";
import Callback from "./auth/pages/Callback";
import AuthorizeRedirect from "./auth/pages/AuthorizeRedirect";
import ErrorPage from "./auth/pages/ErrorPage";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import UserPool from "./pages/UserPool";
import Roles from "./pages/Roles";
import AppClient from "./pages/AppClient";
import AuditLogs from "./pages/AuditLogs";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import IdpLayout from "./layouts/IdpLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthorizeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/error" element={<ErrorPage />} />

        {/* Protected Route */}
        <Route
          element={
            <ProtectedRoute>
              <IdpLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/user-pool" element={<UserPool />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/app-client" element={<AppClient />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}