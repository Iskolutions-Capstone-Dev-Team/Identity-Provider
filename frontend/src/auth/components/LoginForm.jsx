import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import ErrorAlert from "../../components/ErrorAlert";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { buildAccessDeniedPath } from "../utils/loginRoute";
import { beginPendingMfaSession } from "../utils/authCookies";
import { EmailIcon, PasswordIcon, EyeIcon, EyeSlashIcon } from "./authIcons";

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

  const handleEmailBlur = () => {
    const emailError = getEmailError(email);

    setFieldErrors((prev) => ({
      ...prev,
      email: emailError,
    }));

    setError(emailError);
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

  const handlePasswordBlur = () => {
    const passwordError = getPasswordError(password);

    setFieldErrors((prev) => ({
      ...prev,
      password: passwordError,
    }));

    setError(passwordError);
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
      const redirectUrl = await authService.login(email, password, clientId);

      if (!redirectUrl) {
        setError("Invalid server response. Please contact support.");
        return;
      }

      if (onLoginSuccess) {
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
        navigate(buildAccessDeniedPath(clientId, { redirectUri }), {
          replace: true,
        });
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
        <div className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
          <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-6 sm:px-9 sm:py-7 lg:px-10">
            <div className="space-y-5">
              <div className="space-y-3 text-center">
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)] transition duration-300 hover:scale-105"/>
                <div className="space-y-2">
                  <h2 className="text-[1.55rem] font-bold leading-none text-white">
                    Sign in <span className="text-[#ffd700]">PUPTian!</span>
                  </h2>
                  <p className="text-base font-light text-white/70">
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
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                      <EmailIcon />
                    </span>
                    <input type="email" value={email} onChange={handleEmailChange} onBlur={handleEmailBlur} required placeholder="Enter your email"
                      className={`h-12 w-full rounded-xl border bg-white/95 pl-16 pr-4 text-base text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
                        fieldErrors.email
                          ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                          : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
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
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                      <PasswordIcon />
                    </span>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} onBlur={handlePasswordBlur} required placeholder="Enter your password"
                      className={`h-12 w-full rounded-xl border bg-white/95 pl-16 pr-14 text-base text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
                        fieldErrors.password
                          ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                          : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
                      }`}
                    />
                    <button type="button" onClick={toggleShowPassword} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <EyeSlashIcon />
                      ) : (
                        <EyeIcon />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="pl-1 pt-2 text-xs text-red-100/95">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>

                <button type="submit" className="btn mt-2 h-12 w-full rounded-xl border-[#ffd700] bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
                  SIGN IN
                </button>

                <div className="flex items-center gap-4 text-xs text-white/55">
                  <span className="h-px flex-1 bg-white/15" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-white/15" />
                </div>

                <Link to={registerPath} className="block text-center text-sm font-medium text-white/85 transition duration-300 hover:text-white">
                  Need an account?{" "}
                  <span className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">
                    Register
                  </span>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setForgotOpen(false)}
        emailAddress={email}
      />
    </>
  );
}