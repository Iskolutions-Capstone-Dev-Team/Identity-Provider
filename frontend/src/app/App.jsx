import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/components/ProtectedRoute";
import PermissionRoute from "../auth/components/PermissionRoute";
import AuthLoadingScreen from "../auth/components/AuthLoadingScreen";
import IdpLayout from "../layouts/IdpLayout";
import { PermissionProvider } from "../providers/PermissionProvider";
import { ROUTE_PATHS } from "../routes/routePaths";
import { APP_CLIENT_PAGE_PERMISSIONS, PERMISSIONS, REGISTRATION_PAGE_PERMISSIONS, USER_POOL_PAGE_PERMISSIONS } from "../routes/routePermissions";
import { buildAccessDeniedPath, ACCESS_DENIED_PATH, LEGACY_UNAUTHORIZED_PATH } from "../auth/utils/loginRoute";

const Login = lazy(() => import("../auth/pages/Login"));
const Register = lazy(() => import("../auth/pages/Register"));
const RegisterPasswordSetup = lazy(() => import("../auth/pages/RegisterPasswordSetup"));
const Logout = lazy(() => import("../auth/pages/Logout"));
const Callback = lazy(() => import("../auth/pages/Callback"));
const AuthorizeRedirect = lazy(() => import("../auth/pages/AuthorizeRedirect"));
const ErrorPage = lazy(() => import("../auth/pages/ErrorPage"));
const AccessDenied = lazy(() => import("../auth/pages/AccessDenied"));
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const UserPool = lazy(() => import("../features/user-pool/pages/UserPool"));
const AddUserPage = lazy(() => import("../features/user-pool/pages/AddUserPage"));
const Roles = lazy(() => import("../features/roles/pages/Roles"));
const CreateRolePage = lazy(() => import("../features/roles/pages/CreateRolePage"));
const AppClient = lazy(() => import("../features/app-clients/pages/AppClient"));
const CreateAppClientPage = lazy(() => import("../features/app-clients/pages/CreateAppClientPage"));
const AuditLogs = lazy(() => import("../features/audit-logs/pages/AuditLogs"));
const FAQ = lazy(() => import("../features/faq/pages/FAQ"));
const Registration = lazy(() => import("../features/registration/pages/Registration"));
const CreateRegistrationConfigPage = lazy(() => import("../features/registration/pages/CreateRegistrationConfigPage"));
const Profile = lazy(() => import("../features/profile/pages/Profile"));
const Placeholder = lazy(() => import("../pages/Placeholder"));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<AuthLoadingScreen spinnerOnly />}>
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
      </Suspense>
    </Router>
  );
}
