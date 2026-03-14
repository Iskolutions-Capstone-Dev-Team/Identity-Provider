import { useNavigate } from "react-router-dom";
import StatusPage from "../components/StatusPage";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <StatusPage
      code="403"
      message="Unauthorized Access"
      buttonLabel="Return to Login"
      onButtonClick={() => navigate("/logout", { replace: true })}
    />
  );
}