import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAllRoles } from "../../hooks/useAllRoles";
import MultiSelect from "../MultiSelect";
import ModalSteps from "../ModalSteps";
import ErrorAlert from "../ErrorAlert";
import {
  userPoolModalBodyClassName,
  userPoolModalBodyStackClassName,
  userPoolModalBoxClassName,
  userPoolModalCloseButtonClassName,
  userPoolModalFooterActionsClassName,
  userPoolModalFooterClassName,
  userPoolModalHeaderClassName,
  userPoolModalHeaderDescriptionClassName,
  userPoolModalHeaderTitleClassName,
  userPoolModalHelperTextClassName,
  userPoolModalInputClassName,
  userPoolModalLabelClassName,
  userPoolModalOverlayClassName,
  userPoolModalPrimaryButtonClassName,
  userPoolModalSecondaryButtonClassName,
  userPoolModalSectionClassName,
  userPoolModalStepsWrapClassName,
} from "../user-pool/modalTheme";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const GRANT_OPTIONS = [
  "authorization_code",
  "refresh_token",
  "client_credentials",
];

const dropzoneBaseClassName =
  "relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition duration-300";
const imagePreviewCloseButtonClassName =
  "btn btn-circle btn-sm absolute -right-3 -top-3 border border-[#7b0d15]/10 bg-white text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeRoleIds = (values = []) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => toPositiveInt(value))
        .filter((value) => value !== null),
    ),
  );

const getDropzoneClassName = (isDragging) =>
  `${dropzoneBaseClassName} ${
    isDragging
      ? "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(255,247,220,0.92),rgba(255,244,220,0.84))]"
      : "border-[#7b0d15]/12 hover:border-[#f8d24e]/65 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,238,0.94))]"
  }`;

const getGrantClassName = (isSelected) =>
  `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
    isSelected
      ? "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
      : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41] hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"
  }`;

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

  const roleOptions = useMemo(
    () =>
      rolesData
        .map((role) => {
          const roleId = toPositiveInt(role?.id);
          if (roleId === null || !role?.role_name) return null;
          return { id: roleId, role_name: role.role_name };
        })
        .filter(Boolean),
    [rolesData],
  );

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
    }
  }, [open]);

  const toggleGrant = (grant) => {
    if (grants.includes(grant)) {
      setGrants(grants.filter((value) => value !== grant));
      return;
    }

    setGrants([...grants, grant]);
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

  const handleImageChange = (event) => {
    validateAndProcessFile(event.target.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndProcessFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);

    const input = document.getElementById("dropzone-file-create");
    if (input) {
      input.value = "";
    }
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

    if (step === 3 && grants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
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

    setError("");
    const roleIds = normalizeRoleIds(roles);
    const selectedRoleOptions = roleIds
      .map((roleId) => roleOptions.find((role) => role.id === roleId))
      .filter(Boolean);
    const selectedRoleNames = Array.from(
      new Set(selectedRoleOptions.map((role) => role.role_name).filter(Boolean)),
    );

    try {
      await onSubmit({
        name,
        tag,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        grants,
        roles: roleIds,
        roleNames: selectedRoleNames,
        roleOptions: selectedRoleOptions,
        imageFile,
      });
      onClose();
    } catch (submitError) {
      console.error("Create app client error:", submitError);
      setError(
        "Unable to create app client. Please check selected roles and try again.",
      );
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <dialog open className={userPoolModalOverlayClassName}>
        <div className={userPoolModalBoxClassName}>
          <div className={userPoolModalHeaderClassName}>
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-2xl">
                <h3 className={userPoolModalHeaderTitleClassName}>
                  Create App Client
                </h3>
                <p className={userPoolModalHeaderDescriptionClassName}>
                  Register a new application for integration.
                </p>
              </div>

              <button type="button" className={userPoolModalCloseButtonClassName} onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={userPoolModalBodyClassName}>
            <div className={userPoolModalBodyStackClassName}>
              <div className={userPoolModalStepsWrapClassName}>
                <ModalSteps currentStep={step}
                  steps={[
                    <>
                      <span className="step-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                        </svg>
                      </span>
                      Basic Info
                    </>,
                    <>
                      <span className="step-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                        </svg>
                      </span>
                      URLs
                    </>,
                    <>
                      <span className="step-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clipRule="evenodd"/>
                        </svg>
                      </span>
                      Grants
                    </>,
                  ]}
                />
              </div>

              <ErrorAlert message={error} onClose={() => setError("")} />

              {step === 1 && (
                <>
                  <section className={userPoolModalSectionClassName}>
                    <label className={userPoolModalLabelClassName}>
                      System Logo <span className="text-red-500">*</span>
                    </label>
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={getDropzoneClassName(isDragging)}>
                      {!imagePreview ? (
                        <label htmlFor="dropzone-file-create" className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                          <div className="space-y-3">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15]">
                              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#7b0d15]">
                                Click to upload
                              </p>
                              <p className="mt-1 text-sm text-[#8f6f76]">
                                or drag and drop
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#9b7d84]">
                                PNG or JPG | Max 5MB
                              </p>
                            </div>
                          </div>
                          <input id="dropzone-file-create" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange}/>
                        </label>
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center">
                          <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-[1.25rem] object-contain shadow-[0_24px_45px_-30px_rgba(43,3,7,0.45)] transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                          <button type="button" onClick={removeImage} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#7b0d15]/10 bg-white/95 text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className={userPoolModalSectionClassName}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className={userPoolModalLabelClassName}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required minLength={5} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="(e.g., Identity Provider System)" className={userPoolModalInputClassName}/>
                        <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                          Must be 5-100 characters
                        </p>
                      </div>

                      <div>
                        <label className={userPoolModalLabelClassName}>
                          Tag <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required maxLength={10} value={tag}
                          onChange={(event) =>
                            setTag(event.target.value.toUpperCase())
                          }
                          placeholder="(e.g., IdP)" className={userPoolModalInputClassName}/>
                        <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                          Maximum 10 characters
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className={userPoolModalLabelClassName}>
                        Description
                      </label>
                      <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="3" placeholder="Short description of the application (optional)" className="w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 py-3 text-sm text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition focus:border-[#d4a017] resize-none"/>
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <section className={userPoolModalSectionClassName}>
                  <div className="space-y-5">
                    <div>
                      <label className={userPoolModalLabelClassName}>
                        Base URL <span className="text-red-500">*</span>
                      </label>
                      <input type="url" required value={baseURL} onChange={(event) => setBaseURL(event.target.value)} placeholder="https://app.example.com" className={userPoolModalInputClassName} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>

                    <div>
                      <label className={userPoolModalLabelClassName}>
                        Redirect URL <span className="text-red-500">*</span>
                      </label>
                      <input type="url" required value={redirectURL} onChange={(event) => setRedirectURL(event.target.value)} placeholder="https://app.example.com/callback" className={userPoolModalInputClassName} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>

                    <div>
                      <label className={userPoolModalLabelClassName}>
                        Logout URL <span className="text-red-500">*</span>
                      </label>
                      <input type="url" required value={logoutURL} onChange={(event) => setLogoutURL(event.target.value)} placeholder="https://app.example.com/logout" className={userPoolModalInputClassName} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL"/>
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <>
                  <section className={userPoolModalSectionClassName}>
                    <label className={userPoolModalLabelClassName}>
                      Grants <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {GRANT_OPTIONS.map((grant) => {
                        const isSelected = grants.includes(grant);

                        return (
                          <label key={grant} className={getGrantClassName(isSelected)}>
                            <input type="checkbox" name="grants" value={grant} className="checkbox h-5 w-5 rounded border-[#7b0d15]/20 bg-transparent checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white" checked={isSelected} onChange={() => toggleGrant(grant)} required={grants.length === 0} title="Required"/>
                            <span className="break-all">{grant}</span>
                          </label>
                        );
                      })}
                    </div>
                    {grants.length === 0 && (
                      <p className="mt-3 text-xs text-red-500">
                        At least one grant is required.
                      </p>
                    )}
                  </section>

                  <section className={userPoolModalSectionClassName}>
                    <label className={userPoolModalLabelClassName}>Roles</label>
                    <p className={userPoolModalHelperTextClassName}>
                      select roles that are permitted to use this client
                    </p>
                    <MultiSelect
                      options={roleOptions}
                      selectedValues={roles}
                      onChange={(ids) => setRoles(normalizeRoleIds(ids))}
                      placeholder="Select roles"
                      variant="userpoolModal"
                    />
                  </section>
                </>
              )}
            </div>
          </div>

          <div className={userPoolModalFooterClassName}>
            <div className={userPoolModalFooterActionsClassName}>
              {step === 1 ? (
                <button type="button" onClick={onClose} className={userPoolModalSecondaryButtonClassName}>
                  Close
                </button>
              ) : (
                <button type="button" onClick={() => setStep(step - 1)} className={userPoolModalSecondaryButtonClassName}>
                  Back
                </button>
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className={userPoolModalPrimaryButtonClassName}>
                  Next
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className={userPoolModalPrimaryButtonClassName}>
                  Create Client
                </button>
              )}
            </div>
          </div>
        </div>
      </dialog>

      {showFullImage && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-6" onClick={() => setShowFullImage(false)}>
          <div className="absolute inset-0 bg-[rgba(43,3,7,0.72)] backdrop-blur-sm" />
          <div className="relative pointer-events-none flex max-w-4xl items-center justify-center">
            <button type="button" className={`${imagePreviewCloseButtonClassName} pointer-events-auto`} onClick={() => setShowFullImage(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <img src={imagePreview} className="pointer-events-auto max-h-[88vh] max-w-full rounded-[1.5rem] border border-white/10 bg-white/90 object-contain shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)]" alt="Full Preview"/>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}