import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TermsAgreementModal({ open, onClose, onContinue }) {
    const navigate = useNavigate();
    const dialogRef = useRef(null);
    const [agreed, setAgreed] = useState(false);
    const [cancelClicked, setCancelClicked] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            setAgreed(false);
            setCancelClicked(false);

            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [open]);

    const handleCancel = () => {
        setCancelClicked(true);
        dialogRef.current?.close();
    };

    const handleContinue = () => {
        if (!agreed) return;
        onContinue?.();
        onClose?.();
    };

    const handleDialogClose = () => {
        onClose?.();
        
        if (cancelClicked) {
            navigate("/logout", { replace: true });
        }
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={handleDialogClose}>
            <div className="modal-box p-0 max-w-3xl w-[90vw] rounded-xl overflow-hidden">
                <div className="bg-[#991b1b] px-6 py-5">
                    <h3 className="text-white text-2xl font-semibold">Terms and Conditions</h3>
                </div>
                <div className="px-6 py-5 text-gray-700 space-y-4 bg-white">
                    <p className="leading-relaxed">
                        By clicking <span className="font-semibold">“I Agree”</span>, you consent to the collection, use, and
                        processing of your personal data for legitimate purposes related to this service.
                    </p>
                    <p className="leading-relaxed">
                        Your information will be handled in accordance with our{" "}
                        <a href="https://www.pup.edu.ph/privacy/" className="font-semibold text-[#991b1b] no-underline hover:opacity-80" target="_blank" rel="noreferrer">
                        Privacy Policy
                        </a>{" "}
                        and in compliance with the <span className="font-semibold">Data Privacy Act of 2012</span>.
                    </p>
                    <div className="grid gap-3 pt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="checkbox w-5 h-5 border-gray-400 checked:border-[#991b1b] checked:bg-[#991b1b]"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="text-sm leading-6">
                                I Agree and acknowledge the{" "}
                                <a href="https://www.pup.edu.ph/terms/" className="font-semibold text-[#991b1b] no-underline hover:opacity-80" target="_blank" rel="noreferrer">
                                    Terms and Conditions
                                </a>
                            </span>
                        </label>

                        <label className="flex items-center gap-3 md:justify-self-end">
                            <input type="checkbox" className="checkbox w-5 h-5 border-gray-400 checked:border-[#991b1b] checked:bg-[#991b1b]" />
                            <span className="text-sm leading-6">Never show again today</span>
                        </label>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-white">
                    <button type="button" onClick={handleCancel} className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">
                        Cancel
                    </button>
                    <button type="button" onClick={handleContinue} disabled={!agreed} className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#991b1b] disabled:hover:border-[#991b1b] disabled:hover:text-white">
                        Continue
                    </button>
                </div>
            </div>
        </dialog>
    );
}
