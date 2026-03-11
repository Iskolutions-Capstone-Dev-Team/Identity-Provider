import { useState } from "react";

export default function ChangePasswordStep({ form, setForm, onNext, onClose, showCurrentPassword = true }) {
    const [showPassword, setShowPassword] = useState({
        currentPassord: false,
        newPassword: false,
        confirmPassword: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // ✅ Compute validation
    const p = form.newPassword || "";
    const checks = {
        length: p.length >= 8,
        uppercase: /[A-Z]/.test(p),
        number: /[0-9]/.test(p),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    };

    const valid =
        Object.values(checks).every(Boolean) &&
        form.newPassword !== "" &&
        form.newPassword === form.confirmPassword;

    const handleNext = () => {
        if (!valid) return;
        onNext();
    };

    const fields = showCurrentPassword
        ? ["currentPassword", "newPassword", "confirmPassword"]
        : ["newPassword", "confirmPassword"];

    return (
        <div className="custom-scrollbar">
            <div className="bg-linear-to-r from-red-800 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Change Password</h3>
                        <p className="text-white/90 mt-1">Secure your account with a new password</p>
                        
                    </div>
                    <button type="button" className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-6 bg-white">
                <form className="space-y-4">
                    {fields.map((field) => (
                        <div className="space-y-2" key={field}>
                            <label className="block text-sm font-semibold text-gray-700">
                                {field === "currentPassword"
                                    ? "Current Password"
                                    : field === "newPassword"
                                    ? "New Password"
                                    : "Confirm New Password"}{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input value={form[field]} type={showPassword[field] ? "text" : "password"} name={field} 
                                    placeholder={
                                        field === "currentPassword"
                                            ? "Enter current password"
                                            : field === "newPassword"
                                            ? "Enter new password"
                                            : "Confirm new password"
                                    } 
                                    className="input input-bordered w-full pr-10 bg-transparent h-12 border-gray-200 rounded-lg text-gray-700 text-base" onChange={handleChange} required />
                                <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={() => toggleShowPassword(field)}>
                                    {showPassword[field] ? (
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
                            {field === "newPassword" && (
                                <div className="text-xs text-gray-500 space-y-1 mt-2">
                                    <p className="flex items-center gap-1">
                                        <span className={checks.length ? "text-green-400" : ""}>✓</span> At least 8 characters
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <span className={checks.uppercase ? "text-green-400" : ""}>✓</span> One uppercase letter
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <span className={checks.number ? "text-green-400" : ""}>✓</span> One number
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <span className={checks.special ? "text-green-400" : ""}>✓</span> One special character
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </form>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
                    <div className="text-sm text-gray-500">
                        <span className="text-red-500">*</span> Required fields
                    </div>
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" disabled={!valid} className={`btn border-[#991b1b] 
                            ${valid 
                                ? "bg-[#991b1b] text-white hover:bg-[#ffd700] hover:text-[#991b1b] hover:border-[#ffd700]"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                            }`} 
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}