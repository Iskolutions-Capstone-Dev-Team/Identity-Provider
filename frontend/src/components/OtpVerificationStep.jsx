import { useRef, useEffect } from "react";

export default function OtpVerificationStep({ otp, setOtp, timer, canResend, onResend, onBack, onVerify, onClose }) {
    const inputsRef = useRef([]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }

        if (updated.join("").length === 6) {
            onVerify();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    return (
        <div className="custom-scrollbar">
            <div className="bg-linear-to-r from-red-800 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Verify Identity</h3>
                        <p className="text-white/90 mt-1">Enter the OTP sent to your email</p>
                    </div>
                    <button type="button" className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-6 bg-white">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Check Your Email</h4>
                    <p className="text-gray-600 mt-2">We've sent a 6-digit verification code to
                        <span className="font-medium text-[#991b1b] block mt-1">juan.delacruz@iskolarngbayan.pup.edu.ph</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">The code will expire in 10 minutes</p>
                </div>

                <div className="space-y-4">
                    <div className="text-center">
                        <div className="flex justify-center gap-2 mb-4">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputsRef.current[idx] = el)}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 text-gray-700 rounded-lg focus:border-[#991b1b] focus:ring-1 focus:ring-[#991b1b] outline-none"
                                    maxLength={1}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">Enter the 6-digit code</p>
                    </div>

                    <div className="hidden p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">Invalid OTP code</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">Didn't receive the code?</p>
                        <button type="button" disabled={!canResend} onClick={onResend} className={`text-sm font-medium mt-1 ${canResend ? "text-[#991b1b] hover:text-red-700" : "text-gray-400 cursor-not-allowed"}`}>
                            Resend OTP
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Resend available in{" "} <span className="font-mono">00:{String(timer).padStart(2, "0")}</span></p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-3">
                    <div className="flex gap-2">
                        <button type="button" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onVerify}>
                            Verify & Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}