import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";

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

        localStorage.setItem("access_token", tokenResponse.access_token);

        navigate("/idp/user-pool");

      } catch (err) {
        console.error(err);
        navigate("/401");
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-32 md:w-50 float-logo"/>
    </div>
  );
}