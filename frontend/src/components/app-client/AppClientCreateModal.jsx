import { useState, useEffect } from "react";
import { useAllRoles } from "../../hooks/useAllRoles";
import MultiSelect from "../MultiSelect";
import ModalSteps from "../ModalSteps";
import ErrorAlert from "../ErrorAlert";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export default function AppClientCreateModal({ open, onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [tag, setTag] = useState("");
    const [description, setDescription] = useState("");
    const [baseURL, setBaseURL] = useState("");
    const [redirectURL, setRedirectURL] = useState("");
    const [logoutURL, setLogoutURL] = useState("");
    const [grants, setGrants] = useState(["authorization_code"]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const rolesData = useAllRoles();
    const [roles, setRoles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [error, setError] = useState("");
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep(1);
            setName("");
            setTag("");
            setDescription("");
            setBaseURL("");
            setRedirectURL("");
            setLogoutURL("");
            setGrants(["authorization_code"]);
            setRoles([]);
            setImageFile(null);
            setImagePreview(null);
            setIsDragging(false);
            setShowFullImage(false);
            setError("");
            setAttemptedSubmit(false);
        }
    }, [open]);

    const toggleGrant = (grant) => {
        if (grants.includes(grant)) {
            setGrants(grants.filter((g) => g !== grant));
        } else {
            setGrants([...grants, grant]);
        }
    };

      const validateAndProcessFile = (file) => {
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError("System logo must be a PNG or JPG file.");
            return;
        }

        if (file.size > MAX_LOGO_BYTES) {
            setError("System logo must be 5MB max.");
            return;
        }

        setError("");
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e) => {
        validateAndProcessFile(e.target.files?.[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        validateAndProcessFile(e.dataTransfer.files?.[0]);
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        const input = document.getElementById("dropzone-file-create");
        if (input) input.value = "";
    };

    const nextStep = () => {
        if (step === 1) {
            if (!imageFile) {
                setError("System logo is required.");
                return;
            }
            if (!name.trim() || name.length < 5 || name.length > 100) {
                setError("Client name must be between 5 and 100 characters.");
                return;
            }
            if (!tag.trim() || tag.length > 10) {
                setError("Tag is required (max 10 characters).");
                return;
            }
        }
        if (step === 2) {
            if (!baseURL.trim() || !redirectURL.trim() || !logoutURL.trim()) {
                setError("All URL fields are required.");
                return;
            }
        }
        if (step === 3) {
            if (grants.length === 0) {
                setError("At least one grant must be selected.");
                return;
            }
            if (!roles || roles.length === 0) {
                setError("Please select at least one role.");
                return;
            }
        }
        setError("");
        setStep(step + 1);
    };

    const handleSubmit = () => {
        setAttemptedSubmit(true);
        if (!imageFile) {
            setError("System logo is required.");
            setStep(1);
            return;
        }
        if (!name.trim() || name.length < 5 || name.length > 100) {
            setError("Client name must be between 5 and 100 characters.");
            setStep(1);
            return;
        }
        if (!tag.trim() || tag.length > 10) {
            setError("Tag is required (max 10 characters).");
            setStep(1);
            return;
        }
        if (!baseURL.trim() || !redirectURL.trim() || !logoutURL.trim()) {
            setError("All URL fields are required.");
            setStep(2);
            return;
        }
        if (grants.length === 0) {
            setError("At least one grant must be selected.");
            setStep(3);
            return;
        }
        if (!roles || roles.length === 0) {
            setError("Please select at least one role.");
            setStep(3);
            return;
        }

        setError("");

        onSubmit({
            name,
            tag,
            description,
            base_url: baseURL,
            redirect_uri: redirectURL,
            logout_uri: logoutURL,
            grants,
            roles,
            imageFile,
            });
        onClose();
    };

  if (!open) return null;

  return (
    <>
        <dialog className="modal modal-open z-998">
            <div className="modal-box max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
                <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold">Create App Client</h3>
                            <p className="text-white/90 mt-1">
                                Register a new application for integration.
                            </p>
                        </div>
                        <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                    <ModalSteps
                        currentStep={step}
                        steps={[
                            <>
                                <span className="step-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                                    </svg>
                                </span>Basic Info
                            </>,
                            <>
                                <span className="step-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                                        <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                                    </svg>
                                </span>URLs
                            </>,
                            <>
                                <span className="step-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clipRule="evenodd" />
                                    </svg>
                                </span>Grants
                            </>,
                        ]}
                    />
                    <ErrorAlert message={error} onClose={() => setError("")}/>
                    {step === 1 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="block text-base font-semibold text-gray-700">System Logo<span className="text-red-500"> *</span></label>
                                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 ${
                                    isDragging ? "border-[#991b1b] bg-red-50" : "border-gray-300 bg-gray-50"
                                    } hover:bg-gray-100 cursor-pointer`}
                                >
                                    {!imagePreview ? (
                                    <label htmlFor="dropzone-file-create" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                            <svg className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-[#991b1b]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-xs text-gray-500">
                                                <span className="font-semibold text-[#991b1b]">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase mt-1">PNG or JPG • Max 5MB</p>
                                        </div>
                                        <input id="dropzone-file-create" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange}/>
                                    </label>
                                    ) : (
                                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => setShowFullImage(true)} />
                                        <button type="button" onClick={removeImage} className="absolute top-2 right-2 btn btn-circle btn-xs bg-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] shadow-lg z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#991b1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <label className="block text-base font-semibold text-gray-700">
                                        Name<span className="text-red-500"> *</span>
                                    </label>
                                    <input type="text" required minLength={5} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="(e.g., Identity Provider System)" className="input validator w-full rounded-lg bg-transparent border border-gray-200 text-gray-700"/>
                                    <div className="validator-hint">Must be 5–100 characters</div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="block text-base font-semibold text-gray-700">
                                        Tag<span className="text-red-500"> *</span>
                                    </label>
                                    <input type="text" required maxLength={10} value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} placeholder="(e.g., IdP)" className="input validator w-full rounded-lg bg-transparent border border-gray-200 text-gray-700"/>
                                    <div className="validator-hint">Maximum 10 characters</div>
                                </div>
                            </div>
                            <div className="space-y-0.5 mt-4">
                                <label className="block text-base font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    placeholder="Short description of the application (optional)"
                                    className="textarea w-full rounded-lg border border-gray-200 bg-transparent text-gray-700 resize-none"
                                />
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="space-y-0.5">
                                <label className="block text-base font-semibold text-gray-700">Base URL<span className="text-red-500"> *</span></label>
                                <input type="url" required value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="https://app.example.com" className="input validator w-full rounded-lg border border-gray-200 bg-transparent text-gray-700" pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                                <p className="validator-hint">Must be valid URL</p>
                            </div>

                            <div className="space-y-0.5">
                                <label className="block text-base font-semibold text-gray-700">Redirect URL<span className="text-red-500"> *</span></label>
                                <input type="url" required value={redirectURL} onChange={(e) => setRedirectURL(e.target.value)} placeholder="https://app.example.com/callback" className="input validator w-full rounded-lg border border-gray-200 bg-transparent text-gray-700" pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                                <p className="validator-hint">Must be valid URL</p>
                            </div>

                            <div className="space-y-0.5">
                                <label className="block text-base font-semibold text-gray-700">Logout URL<span className="text-red-500"> *</span></label>
                                <input type="url" required value={logoutURL} onChange={(e) => setLogoutURL(e.target.value)} placeholder="https://app.example.com/logout" className="input validator w-full rounded-lg border border-gray-200 bg-transparent text-gray-700" pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                                <p className="validator-hint">Must be valid URL</p>
                            </div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div className="mb-5">
                                <span className="block text-base font-medium text-gray-700">Grants<span className="text-red-500"> *</span></span>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-5">
                                {["authorization_code", "refresh_token", "client_credentials"].map((grant) => (
                                    <label key={grant} className="flex items-center gap-2 text-gray-700">
                                    <input type="checkbox" name="grants" value={grant} className="checkbox validator border-gray-300 bg-transparent checked:bg-[#991b1b] checked:border-red-900 checked:text-white mr-1" checked={grants.includes(grant)} onChange={() => toggleGrant(grant)} required={grants.length === 0} title="Required"/>
                                    <span className="text-[#991b1b] text-[.7rem] sm:text-sm">{grant}</span>
                                    </label>
                                ))}
                                </div>
                                {grants.length === 0 && (
                                    <p className="text-xs text-[#ff637d] mt-2">At least one grant is required.</p>
                                )}
                            </div>
                            <div className="mt-6">
                                <label className="block text-base font-medium text-gray-700">
                                    Roles<span className="text-red-500"> *</span>
                                </label>
                                <p className="text-xs text-gray-500 italic mb-2">
                                    Select at least one role allowed for this client
                                </p>

                                <MultiSelect
                                    options={rolesData.map(r => ({
                                        id: r.id,
                                        role_name: r.role_name
                                    }))}
                                    selectedValues={roles}
                                    onChange={(ids) => setRoles(ids)}
                                    placeholder="Select roles"
                                />
                                {attemptedSubmit && roles.length === 0 && (
                                    <p className="text-xs text-[#ff637d] mt-2">At least one role is required.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    {step === 1 && (
                        <>
                            <button onClick={onClose} className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">Close</button>
                        </>
                    )}
                    {step > 1 && (
                        <>
                            <button onClick={() => setStep(step - 1)} className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">Back</button>
                        </>
                    )}
                    {step < 3 && (
                        <>
                            <button onClick={nextStep} className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">Next</button>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <button onClick={handleSubmit} className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">Create User</button>
                        </>
                    )}
                </div>
            </div>
        </dialog>
        {showFullImage && (
            <div className="fixed inset-0 flex items-center justify-center z-9999" onClick={() => setShowFullImage(false)}>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div className="relative max-w-4xl p-4 flex flex-col items-center justify-center pointer-events-none">
                <button className="btn btn-circle btn-sm absolute -top-4 -right-4 bg-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] text- pointer-events-auto" onClick={() => setShowFullImage(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#991b1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img src={imagePreview} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl pointer-events-auto" alt="Full Preview"/>
                </div>
            </div>
        )}
    </>
  );
}