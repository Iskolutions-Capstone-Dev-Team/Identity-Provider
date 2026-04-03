import { getOnePortalUrl } from "../utils/unauthorizedPage";

export default function UnauthorizedPage() {
  const onePortalUrl = getOnePortalUrl();

  const handleGoToOnePortal = () => {
    if (typeof window === "undefined" || !onePortalUrl) {
      return;
    }

    window.location.assign(onePortalUrl);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
        <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-28 sm:w-32 float-logo"/>
        <p className="max-w-sm text-base font-medium leading-7 text-white/90 sm:text-lg">
          Your account is unauthorized to access this system.
        </p>
        <button type="button" onClick={handleGoToOnePortal} disabled={!onePortalUrl} className="btn h-12 min-w-56 rounded-lg border-[#ffd700] bg-[#ffd700] px-6 text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/20 disabled:text-white/50 disabled:shadow-none">
          Go to One Portal
        </button>
      </div>
    </div>
  );
}