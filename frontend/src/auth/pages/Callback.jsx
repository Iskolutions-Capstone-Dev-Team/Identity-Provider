import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      try {
        await authService.checkSession();
        navigate("/roles");
      } catch (err) {
        navigate("/401");
      }
    };

    validateSession();
  }, [navigate]);

  return(
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-32 md:w-50 float-logo"/>
    </div>
  );
}