import { useState } from "react";
import { authService } from "../services/authService";
import ErrorAlert from "../../components/ErrorAlert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState("");

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const loginResponse = await authService.login(email, password);
      if (!loginResponse?.redirect_to) {
        setError("Invalid server response. Please contact support.");
        return;
      }
      window.location.href = loginResponse.redirect_to;
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError("Please enter valid credentials.");
      } 
      else if (status === 401) {
        setError("Invalid email or password.");
      } 
      else if (status === 403) {
        setError("Your account is not authorized to access this system.");
      } 
      else if (status === 500) {
        setError("Server error. Please try again later.");
      } 
      else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-md px-7 sm:px-0">
        <div className="card bg-[#991b1b]/75 w-full shadow-2xl backdrop-blur-md border border-white/20">
          <div className="card-body space-y-1">
            <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="h-24 object-contain mx-auto block drop-shadow-[#ffd700] drop-shadow-md mb-1 hover:scale-110 hover:drop-shadow-[#ffd700] hover:drop-shadow-xl transition-all"/>
            <div>
              <h2 className="text-white mb-0 leading-none text-3xl font-bold text-center">Welcome <span className="text-[#ffd700]">PUPTian!</span></h2>
              <p className="text-white/80 text-sm font-extralight text-center">Sign in to access PUPT systems</p>
              <div className="mt-4">
                <ErrorAlert
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            </div>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label className="block font-medium mb-2 text-white text-base">Email Address <span className="text-red-500">*</span></label>
                <label className="input validator flex items-center rounded-lg gap-2 bg-white border border-gray-200 text-gray-700 w-full">
                  <span className="pr-3 border-r border-gray-300 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                        <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="grow bg-transparent border-none rounded-e-lg"
                  />
                </label>
                <div className="validator-hint text-red-50">
                  Enter a valid email address
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2 text-white text-base">Password <span className="text-red-500">*</span></label>
                <div className="relative w-full">
                  <label className="input validator flex items-center rounded-lg gap-2 bg-white border border-gray-200 text-gray-700 w-full">
                    <span className="pr-3 border-r border-gray-300 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="grow bg-transparent border-none rounded-e-lg"
                    />
                  </label>
                  <div className="validator-hint text-red-50">
                    Password is required
                  </div>
                  <button type="button" onClick={toggleShowPassword} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition">
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
              </div>
              <div className="flex items-center justify-between mb-10 mt-10 font-medium">
                <label className="flex items-center gap-1 text-gray-700">
                  <input type="checkbox" className="checkbox w-5 h-5 border-gray-300 bg-transparent checked:bg-[#ffd700] checked:border-[#ffd700] checked:text-white mr-1" />
                  <span className="text-white text-[.8rem]">Remember me</span>
                </label>
                <a href="#" className="link link-hover text-white text-[.8rem]" onClick={(e) => {
                  e.preventDefault();
                  setForgotOpen(true);
                }}>
                  Forgot your password?
                </a>
              </div>
              <button className="btn w-full font-bold text-base rounded-xl bg-[#ffd700] text-[#991b1b] border-[#ffd700] hover:bg-[#991b1b] hover:border-[#991b1b] hover:text-[#ffd700]">LOGIN</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
