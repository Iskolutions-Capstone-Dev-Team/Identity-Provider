import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import RegisterPasswordSetup from "../auth/pages/RegisterPasswordSetup";
import Logout from "../auth/pages/Logout";
import Callback from "../auth/pages/Callback";
import AuthorizeRedirect from "../auth/pages/AuthorizeRedirect";
import ErrorPage from "../auth/pages/ErrorPage";
import AccessDenied from "../auth/pages/AccessDenied";
import ProtectedRoute from "../auth/components/ProtectedRoute";
import PermissionRoute from "../auth/components/PermissionRoute";
import Dashboard from "../features/dashboard/pages/Dashboard";
import UserPool from "../features/user-pool/pages/UserPool";
import AddUserPage from "../features/user-pool/pages/AddUserPage";
import Roles from "../features/roles/pages/Roles";
import CreateRolePage from "../features/roles/pages/CreateRolePage";
import AppClient from "../features/app-clients/pages/AppClient";
import CreateAppClientPage from "../features/app-clients/pages/CreateAppClientPage";
import AuditLogs from "../features/audit-logs/pages/AuditLogs";
import FAQ from "../features/faq/pages/FAQ";
import Registration from "../features/registration/pages/Registration";
import CreateRegistrationConfigPage from "../features/registration/pages/CreateRegistrationConfigPage";
import Profile from "../features/profile/pages/Profile";
import Placeholder from "../pages/Placeholder";
import IdpLayout from "../layouts/IdpLayout";
import { PermissionProvider } from "../providers/PermissionProvider";
import { ROUTE_PATHS } from "../routes/routePaths";
import { APP_CLIENT_PAGE_PERMISSIONS, PERMISSIONS, REGISTRATION_PAGE_PERMISSIONS, USER_POOL_PAGE_PERMISSIONS } from "../routes/routePermissions";
import { buildAccessDeniedPath, ACCESS_DENIED_PATH, LEGACY_UNAUTHORIZED_PATH } from "../auth/utils/loginRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTE_PATHS.ROOT} element={<AuthorizeRedirect />} />
        <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
        <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
        <Route path={ROUTE_PATHS.REGISTER_SET_PASSWORD} element={<RegisterPasswordSetup />}/>
        <Route path={ROUTE_PATHS.CALLBACK} element={<Callback />} />
        <Route path={ROUTE_PATHS.LOGOUT} element={<Logout />} />
        <Route path={ROUTE_PATHS.ERROR} element={<ErrorPage />} />
        <Route path={ACCESS_DENIED_PATH} element={<AccessDenied />} />
        <Route path={LEGACY_UNAUTHORIZED_PATH} element={<Navigate to={buildAccessDeniedPath()} replace />}/>
        <Route path={ROUTE_PATHS.ONE_PORTAL}
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
          <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTE_PATHS.USER_POOL}
            element={
              <PermissionRoute requiredPermissions={USER_POOL_PAGE_PERMISSIONS}>
                <UserPool />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.USER_POOL_CREATE}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.ADD_USER]}>
                <AddUserPage />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.ROLES}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.VIEW_ROLES]}>
                <Roles />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.ROLES_CREATE}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.ADD_ROLES]}>
                <CreateRolePage />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.AUDIT_LOGS}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.VIEW_AUDIT_LOGS]}>
                <AuditLogs />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.FAQ} element={<FAQ />} />
          <Route path={ROUTE_PATHS.APP_CLIENT}
            element={
              <PermissionRoute requiredPermissions={APP_CLIENT_PAGE_PERMISSIONS}>
                <AppClient />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.APP_CLIENT_CREATE}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.ADD_APPCLIENT]}>
                <CreateAppClientPage />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.REGISTRATION}
            element={
              <PermissionRoute requiredPermissions={REGISTRATION_PAGE_PERMISSIONS}>
                <Registration />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.REGISTRATION_CREATE}
            element={
              <PermissionRoute requiredPermissions={[PERMISSIONS.CREATE_REGISTRATION_CONFIG]}>
                <CreateRegistrationConfigPage />
              </PermissionRoute>
            }
          />
          <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
