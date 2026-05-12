import { Navigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import RegisterForm from "../components/RegisterForm";
import { getLoginClientId } from "../utils/loginRoute";

export default function Register() {
  const [searchParams] = useSearchParams();
  const invitationCode = searchParams.get("invitation_code")?.trim() || "";
  const clientId = getLoginClientId(searchParams);

  if (invitationCode) {
    return (
      <Navigate to={`/register/set-password?${searchParams.toString()}`} replace/>
    );
  }

  return (
    <AuthLayout allowDesktopScroll>
      <RegisterForm clientId={clientId} />
    </AuthLayout>
  );
}