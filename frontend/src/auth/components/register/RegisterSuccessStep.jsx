import { Link } from "react-router-dom";

export default function RegisterSuccessStep({ loginPath }) {
  return (
    <div className="space-y-5 text-center">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]"/>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold leading-tight text-white">
          Account Ready
        </h2>
        <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
          Your registration is complete. You can now sign in using your email
          and password.
        </p>
      </div>

      <Link to={loginPath} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
        Go to Login
      </Link>
    </div>
  );
}