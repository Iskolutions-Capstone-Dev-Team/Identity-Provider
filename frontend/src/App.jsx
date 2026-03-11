import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/pages/Login";
import Logout from "./auth/pages/Logout";
import Callback from "./auth/pages/Callback";
import Unauthorized from "./auth/pages/Unauthorized";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import UserPool from "./pages/UserPool";
import Roles from "./pages/Roles";
import AppClient from "./pages/AppClient";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";
import IdpLayout from "./layouts/IdpLayout";
import { buildLoginPath } from "./auth/utils/loginRoute";

export default function App() {
  const defaultLoginPath = buildLoginPath();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to={defaultLoginPath} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/401" element={<Unauthorized />} />

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
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}