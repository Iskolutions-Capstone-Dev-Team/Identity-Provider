import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Callback from "./auth/pages/Callback";
import Logout from "./auth/pages/Logout";
import Unauthorized from "./auth/pages/Unauthorized";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import Roles from "./pages/Roles";
import AppClient from "./pages/AppClient";
import IdpLayout from "./layouts/IdpLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
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
          <Route path="/roles" element={<Roles />} />
          <Route path="/app-client" element={<AppClient />} />
        </Route>
      </Routes>
    </Router>
  );
}