import { useNavigate } from "react-router-dom";
import StatusPage from "../components/StatusPage";
import { buildLoginPath } from "../utils/loginRoute";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <StatusPage
      code="401"
      message="Unauthorized Access"
      buttonLabel="Return to Login"
      onButtonClick={() => navigate(buildLoginPath(), { replace: true })}
    />
  );
}
