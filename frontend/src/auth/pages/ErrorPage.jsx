import { useNavigate } from "react-router-dom";
import StatusPage from "../components/StatusPage";
import {
  clearIdpErrorReturnPath,
  getIdpErrorReturnPath,
} from "../utils/idpErrorPage";

export default function ErrorPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const returnPath = getIdpErrorReturnPath();

    clearIdpErrorReturnPath();
    navigate(returnPath, { replace: true });
  };

  return (
    <StatusPage
      code="401"
      message="Unauthorized Access"
      buttonLabel="Go Back"
      onButtonClick={handleGoBack}
    />
  );
}
