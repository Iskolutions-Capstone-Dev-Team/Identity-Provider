import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Callback from "./auth/pages/Callback";
import Unauthorized from "./auth/pages/Unauthorized";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import Roles from "./pages/Roles";
import IdpLayout from "./layouts/IdpLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
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
        </Route>
      </Routes>
    </Router>
  );
}