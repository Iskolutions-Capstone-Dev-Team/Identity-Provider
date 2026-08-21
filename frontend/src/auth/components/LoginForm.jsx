import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";
import ErrorAlert from "../../components/ErrorAlert";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { buildAccessDeniedPath } from "../utils/loginRoute";
import { beginPendingMfaSession } from "../utils/authCookies";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Card, CardContent } from "../../components/ui/card";

export default function LoginForm({ clientId, redirectUri = "", initialError = "", onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState(initialError);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const registerParams = new URLSearchParams();

  if (clientId) {
    registerParams.set("client_id", clientId);
  }

  if (redirectUri) {
    registerParams.set("redirect_uri", redirectUri);
  }

  const registerQuery = registerParams.toString();
  const registerPath = registerQuery ? `/register?${registerQuery}` : "/register";

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const getEmailError = (value) => {
    if (!value.trim()) {
      return "Email is required.";
    }

    if (!emailRegex.test(value)) {
      return "Enter a valid email address.";
    }

    return "";
  };

  const getPasswordError = (value) => {
    if (!value.trim()) {
      return "Password is required.";
    }

    return "";
  };

  const getValidationAlertMessage = (errors) => {
    const messages = Object.values(errors).filter(Boolean);

    return messages.join(" ");
  };

  const validateFields = () => {
    const nextErrors = {
      email: getEmailError(email),
      password: getPasswordError(password),
    };

    setFieldErrors(nextErrors);

    const validationMessage = getValidationAlertMessage(nextErrors);
    setError(validationMessage);

    return !validationMessage;
  };

  const handleEmailChange = (e) => {
    const nextEmail = e.target.value;
    setEmail(nextEmail);
    setError("");

    setFieldErrors((prev) => ({
      ...prev,
      email: "",
    }));
  };

  const handlePasswordChange = (e) => {
    const nextPassword = e.target.value;
    setPassword(nextPassword);
    setError("");

    setFieldErrors((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) {
      return;
    }

    if (!clientId) {
      setError("Login client is missing.");
      return;
    }

    try {
      const { redirectUrl, hasMfa } = await authService.login(
        email,
        password,
        clientId,
      );

      if (!redirectUrl) {
        setError("Invalid server response. Please contact support.");
        return;
      }

      if (onLoginSuccess && hasMfa) {
        beginPendingMfaSession(email);
        onLoginSuccess({
          email,
          redirectUrl,
        });
        return;
      }

      window.location.href = redirectUrl;
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError("Please enter valid credentials.");
      } else if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        if (err.response?.data?.code === 1030) {
          navigate(buildAccessDeniedPath(clientId, { redirectUri, reason: "suspended" }), {
            replace: true,
          });
        } else {
          navigate(buildAccessDeniedPath(clientId, { redirectUri }), {
            replace: true,
          });
        }
      } else if (status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-[34.5rem] px-1 sm:px-0">
        <Card className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
          <CardContent className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-6 sm:px-9 sm:py-7 lg:px-10">
            <div className="space-y-5">
              <div className="space-y-3 text-center">
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)] transition duration-300 hover:scale-105"/>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Sign in <span className="text-[#ffd700]">PUPTian!</span>
                  </h2>
                  <p className="text-sm text-muted-foreground text-white/70">
                    Sign in to access PUPT systems
                  </p>
                </div>
              </div>

              <div>
                <ErrorAlert
                  message={error}
                  onClose={() => setError("")}
                />
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/90">
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
                      <Mail className="size-5" />
                    </span>
                    <Input type="email" value={email} onChange={handleEmailChange} required placeholder="Enter your email"
                      className={`h-12 w-full rounded-xl bg-background pl-10 pr-4 text-base shadow-sm ${
                        fieldErrors.email
                          ? "border-destructive focus-visible:ring-destructive"
                          : "border-input focus-visible:ring-[#ffd700]"
                      }`}
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="pl-1 pt-2 text-xs text-red-100/95">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-white/90">
                      Password
                    </label>
                    <a href="#" className="text-xs font-medium text-white/70 transition duration-300 hover:text-[#ffd700]"
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotOpen(true);
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
                      <Lock className="size-5" />
                    </span>
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} required placeholder="Enter your password"
                      className={`h-12 w-full rounded-xl bg-background pl-10 pr-10 text-base shadow-sm ${
                        fieldErrors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : "border-input focus-visible:ring-[#ffd700]"
                      }`}
                    />
                    <button type="button" onClick={toggleShowPassword} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="pl-1 pt-2 text-xs text-red-100/95">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" className="mt-2 h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300">
                  SIGN IN
                </Button>

                <div className="flex items-center gap-4 text-xs text-white/55">
                  <Separator className="flex-1 bg-white/15" />
                  <span>or</span>
                  <Separator className="flex-1 bg-white/15" />
                </div>

                <Link to={registerPath} className="block text-center text-sm font-medium text-white/85 transition duration-300 hover:text-white">
                  Don't have an account?{" "}
                  <span className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">
                    Sign up
                  </span>
                </Link>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setForgotOpen(false)}
        emailAddress={email}
      />
    </>
  );
}