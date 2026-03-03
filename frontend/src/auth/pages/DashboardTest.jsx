import { authService } from "../services/authService";

export default function DashboardTest() {

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold text-[#ffd700] mb-4">
        LOGIN SUCCESSFUL
      </h1>
      <p className="mb-8">
        You are authenticated using the Master Cookie (idp_session).
      </p>

      <button
        onClick={handleLogout}
        className="btn bg-[#ffd700] text-[#991b1b] font-bold rounded-xl"
      >
        Logout
      </button>
    </div>
  );
}