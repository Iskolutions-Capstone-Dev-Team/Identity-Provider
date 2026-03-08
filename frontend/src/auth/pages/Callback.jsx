import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { storeTokenResponse } from "../utils/authCookies";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuth = async () => {
      const code = searchParams.get("code");

      if (!code) {
        navigate("/");
        return;
      }

      try {
        const tokenResponse = await authService.exchangeCode(code);

        if (!tokenResponse?.access_token || !tokenResponse?.refresh_token) {
          throw new Error("Token exchange did not return both tokens.");
        }

        storeTokenResponse(tokenResponse);
        sessionStorage.removeItem("termsAccepted");
        setTimeout(() => navigate("/user-pool"), 500);
      } catch (err) {
        console.error(err);
        navigate("/401");
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return(
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-32 md:w-50 float-logo"/>
    </div>
  );
}
