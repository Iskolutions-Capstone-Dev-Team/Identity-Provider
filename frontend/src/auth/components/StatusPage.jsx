export default function StatusPage({
  code = "401",
  message = "Unauthorized Access",
  buttonLabel,
  onButtonClick,
}) {
  return (
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white text-center px-6">
      <img
        src="/assets/images/IDP_Logo.png"
        alt="IDP Logo"
        className="w-32 md:w-50 mb-3 float-logo"
      />
      <h1 className="text-7xl font-bold text-[#ffd700]">{code}</h1>
      <p className="text-md text-[#ffd700]/70">{message}</p>
      <button
        onClick={onButtonClick}
        className="btn btn-lg mt-10 font-bold rounded-xl hover:opacity-90 transition-all bg-white text-[#991b1b] hover:bg-[#ffd700] hover:text-[#991b1b] hover:border-[#ffd700]"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
