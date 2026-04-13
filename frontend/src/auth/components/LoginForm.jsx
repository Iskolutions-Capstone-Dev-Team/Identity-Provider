import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import ErrorAlert from "../../components/ErrorAlert";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { getLoginErrorMessageByCode, LOGIN_ERROR_CODES } from "../utils/loginRoute";

export default function LoginForm({ clientId, initialError = "" }) {
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
  const registerPath = clientId
    ? `/register?client_id=${encodeURIComponent(clientId)}`
    : "/register";

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

      window.location.href = redirectUrl;
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError("Please enter valid credentials.");
      } else if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError(
          getLoginErrorMessageByCode(LOGIN_ERROR_CODES.UNAUTHORIZED),
        );
      } else if (status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-md px-1 sm:px-0">
        <div className="rounded-4xl border border-white/20 bg-white/10 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
          <div className="rounded-[calc(2rem-4px)] bg-[linear-gradient(180deg,rgba(120,12,22,0.72),rgba(60,7,12,0.86))] px-6 py-7 sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <img
                  src="/assets/images/IDP_Logo.png"
                  alt="IDP Logo"
                  className="float-logo mx-auto block h-24 object-contain drop-shadow-[0_12px_20px_rgba(248,210,78,0.35)] transition duration-300 hover:scale-105"
                />
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold leading-none text-white">
                    Welcome <span className="text-[#f8d24e]">PUPTian!</span>
                  </h2>
                  <p className="text-sm font-light text-white/80">
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

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/90">
                    Email Address <span className="text-red-300">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                        <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      required
                      placeholder="Enter your email address"
                      className={`h-14 w-full rounded-2xl border bg-white/95 pl-14 pr-4 text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
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
                      Password <span className="text-red-300">*</span>
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-white/70 transition duration-300 hover:text-[#ffd700]"
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotOpen(true);
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      required
                      placeholder="Enter your password"
                      className={`h-14 w-full rounded-2xl border bg-white/95 pl-14 pr-12 text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
                        fieldErrors.password
                          ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
                          : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.056 10.056 0 012.293-3.607M6.72 6.72A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.978 9.978 0 01-4.563 5.956M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="pl-1 pt-2 text-xs text-red-100/95">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between font-medium">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input type="checkbox" className="checkbox rounded-md border-gray-300 bg-transparent checked:border-yellow-900 checked:bg-[#ffd700] checked:text-white"/>
                    <span>Remember me</span>
                  </label>
                </div>

                <button type="submit" className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
                  LOGIN
                </button>

                <p className="text-center text-sm text-white/80">
                  Don't have an account?{" "}
                  <Link
                    to={registerPath}
                    className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]"
                  >
                    Register here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isForgotOpen}
        onClose={() => setForgotOpen(false)}
        showCurrentPassword={false}
        emailAddress={email}
      />
    </>
  );
}