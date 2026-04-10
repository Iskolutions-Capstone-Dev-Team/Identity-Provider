import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Register from "./auth/pages/Register";
import RegisterPasswordSetup from "./auth/pages/RegisterPasswordSetup";
import Logout from "./auth/pages/Logout";
import Callback from "./auth/pages/Callback";
import AuthorizeRedirect from "./auth/pages/AuthorizeRedirect";
import ErrorPage from "./auth/pages/ErrorPage";
import ProtectedRoute from "./auth/components/ProtectedRoute";
import PermissionRoute from "./auth/components/PermissionRoute";
import UserPool from "./pages/UserPool";
import Roles from "./pages/Roles";
import AppClient from "./pages/AppClient";
import AuditLogs from "./pages/AuditLogs";
import Registration from "./pages/Registration";
import Profile from "./pages/Profile";
import Placeholder from "./pages/Placeholder";
import IdpLayout from "./layouts/IdpLayout";
import { PermissionProvider } from "./context/PermissionContext";
import { PERMISSIONS, REGISTRATION_PAGE_PERMISSIONS, USER_POOL_PAGE_PERMISSIONS } from "./utils/permissionAccess";
import { buildUnauthorizedLoginPath, LEGACY_UNAUTHORIZED_PATH } from "./auth/utils/loginRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthorizeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/set-password" element={<RegisterPasswordSetup />}/>
        <Route path="/callback" element={<Callback />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path={LEGACY_UNAUTHORIZED_PATH} element={<Navigate to={buildUnauthorizedLoginPath()} replace />}/>
        <Route path="/one-portal"
          element={
            <ProtectedRoute>
              <Placeholder />
            </ProtectedRoute>
          }
        />

        {/* Protected Route */}
        <Route
          element={
            <ProtectedRoute>
              <PermissionProvider>
                <IdpLayout />
              </PermissionProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/user-pool"
            element={
              <PermissionRoute requiredPermissions={USER_POOL_PAGE_PERMISSIONS}>
                <UserPool />
              </PermissionRoute>
            }
          />
          <Route path="/roles"
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.VIEW_ROLES]}>
                <Roles />
              </PermissionRoute>
            }
          />
          <Route path="/audit-logs"
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.VIEW_AUDIT_LOGS]}>
                <AuditLogs />
              </PermissionRoute>
            }
          />
          <Route path="/app-client"
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.VIEW_ALL_APPCLIENTS]}>
                <AppClient />
              </PermissionRoute>
            }
          />
          <Route path="/registration"
            element={
              <PermissionRoute requiredPermissions={REGISTRATION_PAGE_PERMISSIONS}>
                <Registration />
              </PermissionRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
