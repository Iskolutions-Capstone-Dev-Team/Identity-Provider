import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#991b1b] flex flex-col items-center justify-center text-white text-center px-6">
            <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-32 md:w-50 mb-3 float-logo"/>
            <h1 className="text-7xl font-bold text-[#ffd700]">401</h1>
            <p className="text-md text-[#ffd700]/70">
                Unauthorized Access
            </p>
            <button onClick={() => navigate("/")} className="btn btn-lg mt-10 font-bold rounded-xl hover:opacity-90 transition-all bg-white text-[#991b1b] hover:bg-[#ffd700] hover:text-[#991b1b] hover:border-[#ffd700]">
                Return to Login
            </button>
        </div>
    );
}