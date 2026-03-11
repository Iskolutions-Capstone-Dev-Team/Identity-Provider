import { useState, useEffect } from "react";
import ChangePasswordStep from "./ChangePasswordStep";
import OtpVerificationStep from "./OtpVerificationStep";
import SuccessStep from "./SuccessStep";
import SuccessAlert from "./SuccessAlert";

export default function ChangePasswordModal({ isOpen, onClose, showCurrentPassword = true, addAuditLog, setToastMessage, enableSuccessAlert = false }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (step !== 2) return;

        setTimer(60);
        setCanResend(false);

        const interval = setInterval(() => {
            setTimer((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [step]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setOtp(["", "", "", "", "", ""]);
            setSuccessMessage("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (step !== 3) return;

        const message = "Password changed successfully!";

        // External toast (Profile flow)
        if (setToastMessage) {
            setToastMessage(message);

            const hide = setTimeout(() => {
                setToastMessage("");
            }, 2500);

            return () => clearTimeout(hide);
        }

        // Internal success alert (Auth flow)
        if (enableSuccessAlert) {
            setSuccessMessage(message);

            const timeout = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [step, setToastMessage, enableSuccessAlert]);

    const verifyOTP = () => {
        const code = otp.join("");
        if (code.length !== 6 || !/^\d+$/.test(code)) return;

        // Optional audit logging
        if (addAuditLog) {
            addAuditLog({
                timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
                action: "PASSWORD_CHANGE",
                details: "Password changed successfully",
                color: "yellow",
            });
        }

        setStep(3);
    };

    if (!isOpen) return null;

    return (
        <>
            <dialog className="modal modal-open">
                <div className="modal-box rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar max-w-md p-0">
                    {step === 1 && (
                        <ChangePasswordStep
                            form={form}
                            setForm={setForm}
                            onClose={onClose}
                            onNext={() => setStep(2)}
                            showCurrentPassword={showCurrentPassword}
                        />
                    )}
                    {step === 2 && (
                        <OtpVerificationStep
                            otp={otp}
                            setOtp={setOtp}
                            timer={timer}
                            canResend={canResend}
                            onResend={() => setStep(1)}
                            onBack={() => setStep(1)}
                            onVerify={verifyOTP}
                            onClose={onClose}
                        />
                    )}
                    {step === 3 && (
                        <SuccessStep onClose={onClose} />
                    )}
                </div>
            </dialog>
            {enableSuccessAlert && (
                <SuccessAlert
                    message={successMessage}
                    onClose={() => setSuccessMessage("")}
                />
            )}
        </>
    );
}