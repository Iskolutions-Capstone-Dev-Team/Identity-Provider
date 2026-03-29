import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ModalSteps from "../ModalSteps";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { getModalTheme } from "../modalTheme";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const GRANT_OPTIONS = [
  "authorization_code",
  "refresh_token",
  "client_credentials",
];
const initialFieldErrors = {
  imageFile: "",
  name: "",
  baseURL: "",
  redirectURL: "",
  logoutURL: "",
};
const inlineErrorClassName = "mt-2 text-xs text-red-500";

const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const getDropzoneBaseClassName = (isDarkMode) =>
  isDarkMode
    ? "relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";

const getImagePreviewCloseButtonClassName = (isDarkMode) =>
  isDarkMode
    ? "btn btn-circle btn-sm absolute -right-3 -top-3 border border-white/12 bg-[#111827] text-[#f4eaea] shadow-[0_18px_40px_-24px_rgba(2,6,23,0.82)] transition hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "btn btn-circle btn-sm absolute -right-3 -top-3 border border-[#7b0d15]/10 bg-white text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

const getDropzoneClassName = ({ isDragging, hasError, isDarkMode }) =>
  `${getDropzoneBaseClassName(isDarkMode)} ${
    hasError
      ? isDarkMode
        ? "border-red-400 bg-[linear-gradient(180deg,rgba(60,15,20,0.72),rgba(35,18,26,0.9))]"
        : "border-red-400 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,244,0.94))]"
      : isDragging
        ? isDarkMode
          ? "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(123,13,21,0.2),rgba(32,22,30,0.92))]"
          : "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(255,247,220,0.92),rgba(255,244,220,0.84))]"
        : isDarkMode
          ? "border-white/10 hover:border-[#f8d24e]/45 hover:bg-[linear-gradient(180deg,rgba(14,20,33,0.82),rgba(30,20,30,0.92))]"
          : "border-[#7b0d15]/12 hover:border-[#f8d24e]/65 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,238,0.94))]"
  }`;

const getGrantClassName = ({ isSelected, isDarkMode }) =>
  `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
    isSelected
      ? isDarkMode
        ? "border-[#f8d24e]/35 bg-[#f8d24e]/12 text-[#ffe28a]"
        : "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
      : isDarkMode
        ? "border-white/10 bg-white/[0.04] text-[#d6c3c7] hover:border-[#f8d24e]/35 hover:bg-[#f8d24e]/10"
        : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41] hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"
  }`;

export default function AppClientCreateModal({ open, onClose, onSubmit, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
    modalStepsWrapClassName,
  } = getModalTheme(colorMode);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [grants, setGrants] = useState(["authorization_code"]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const uploadIconWrapClassName = isDarkMode
    ? "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8d24e]/12 text-[#ffe28a]"
    : "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15]";
  const uploadTitleClassName = isDarkMode
    ? "text-sm font-semibold text-[#f4eaea]"
    : "text-sm font-semibold text-[#7b0d15]";
  const uploadSubtitleClassName = isDarkMode
    ? "mt-1 text-sm text-[#a58d95]"
    : "mt-1 text-sm text-[#8f6f76]";
  const uploadHintClassName = isDarkMode
    ? "mt-2 text-xs uppercase tracking-[0.16em] text-[#9f8790]"
    : "mt-2 text-xs uppercase tracking-[0.16em] text-[#9b7d84]";
  const previewRemoveButtonClassName = isDarkMode
    ? "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#111827]/95 text-[#f4eaea] shadow-[0_18px_40px_-24px_rgba(2,6,23,0.82)] transition hover:border-[#f8d24e]/60 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#7b0d15]/10 bg-white/95 text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const textareaClassName = isDarkMode
    ? "w-full rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] px-4 py-3 text-sm text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-[background-color,border-color,color,box-shadow] duration-500 ease-out focus:border-[#f8d24e]/55 resize-none placeholder:text-[#9f8790]"
    : "w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 py-3 text-sm text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition-[background-color,border-color,color,box-shadow] duration-500 ease-out focus:border-[#d4a017] resize-none";
  const grantCheckboxClassName = isDarkMode
    ? "checkbox h-5 w-5 rounded border-white/20 bg-transparent checked:border-[#f8d24e] checked:bg-[#7b0d15] checked:text-white"
    : "checkbox h-5 w-5 rounded border-[#7b0d15]/20 bg-transparent checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white";
  const fullImageBackdropClassName = isDarkMode
    ? "absolute inset-0 bg-[rgba(9,13,20,0.82)] backdrop-blur-sm"
    : "absolute inset-0 bg-[rgba(43,3,7,0.72)] backdrop-blur-sm";
  const fullImageClassName = isDarkMode
    ? "pointer-events-auto max-h-[88vh] max-w-full rounded-[1.5rem] border border-white/10 bg-[#111827] object-contain shadow-[0_36px_90px_-40px_rgba(2,6,23,0.9)]"
    : "pointer-events-auto max-h-[88vh] max-w-full rounded-[1.5rem] border border-white/10 bg-white/90 object-contain shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)]";

  useEffect(() => {
    if (!open) {
      setStep(1);
      setName("");
      setDescription("");
      setBaseURL("");
      setRedirectURL("");
      setLogoutURL("");
      setGrants(["authorization_code"]);
      setImageFile(null);
      setImagePreview(null);
      setIsDragging(false);
      setShowFullImage(false);
      setActiveVoiceField("name");
      setError("");
      setFieldErrors(initialFieldErrors);
    }
  }, [open]);

  useEffect(() => {
    if (step === 1) {
      if (!["name", "description"].includes(activeVoiceField)) {
        setActiveVoiceField("name");
      }
      return;
    }

    if (step === 2 && !["baseURL", "redirectURL", "logoutURL"].includes(activeVoiceField)) {
      setActiveVoiceField("baseURL");
    }
  }, [activeVoiceField, step]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) =>
      current[fieldName]
        ? {
            ...current,
            [fieldName]: "",
          }
        : current,
    );
  };

  const updateFieldValue = (fieldName, value, setter) => {
    setter(value);
    clearFieldError(fieldName);

    if (error) {
      setError("");
    }
  };

  const getInputClassName = (fieldName, hasActionButton = false) =>
    `${modalInputClassName} ${hasActionButton ? "pr-12" : ""} ${
      fieldErrors[fieldName] ? "border-red-400 focus:border-red-500" : ""
    }`;

  const activeVoiceFieldLabel =
    activeVoiceField === "description"
      ? "Description"
      : activeVoiceField === "baseURL"
        ? "Base URL"
        : activeVoiceField === "redirectURL"
            ? "Redirect URL"
            : activeVoiceField === "logoutURL"
              ? "Logout URL"
              : "Name";

  const handleVoiceInput = (transcript) => {
    if (activeVoiceField === "description") {
      setError("");
      setDescription((currentDescription) =>
        currentDescription.trim()
          ? `${currentDescription.trimEnd()} ${transcript}`
          : transcript,
      );
      return;
    }

    if (activeVoiceField === "baseURL") {
      updateFieldValue("baseURL", transcript, setBaseURL);
      return;
    }

    if (activeVoiceField === "redirectURL") {
      updateFieldValue("redirectURL", transcript, setRedirectURL);
      return;
    }

    if (activeVoiceField === "logoutURL") {
      updateFieldValue("logoutURL", transcript, setLogoutURL);
      return;
    }

    updateFieldValue("name", transcript, setName);
  };

  const validateBasicInfo = () => {
    const trimmedName = name.trim();
    const nextFieldErrors = {
      ...initialFieldErrors,
      baseURL: fieldErrors.baseURL,
      redirectURL: fieldErrors.redirectURL,
      logoutURL: fieldErrors.logoutURL,
    };

    if (!imageFile) {
      nextFieldErrors.imageFile = "System logo is required.";
    }

    if (!trimmedName) {
      nextFieldErrors.name = "Client name is required.";
    } else if (trimmedName.length < 5 || trimmedName.length > 100) {
      nextFieldErrors.name = "Client name must be between 5 and 100 characters.";
    }

    setFieldErrors(nextFieldErrors);

    const firstError = nextFieldErrors.imageFile || nextFieldErrors.name;

    if (firstError) {
      setError(firstError);
      return false;
    }

    return true;
  };

  const validateUrls = () => {
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const nextFieldErrors = {
      ...initialFieldErrors,
      imageFile: fieldErrors.imageFile,
      name: fieldErrors.name,
    };

    if (!trimmedBaseURL) {
      nextFieldErrors.baseURL = "Base URL is required.";
    } else if (!isValidHttpUrl(trimmedBaseURL)) {
      nextFieldErrors.baseURL = "Base URL must be a valid URL.";
    }

    if (!trimmedRedirectURL) {
      nextFieldErrors.redirectURL = "Redirect URL is required.";
    } else if (!isValidHttpUrl(trimmedRedirectURL)) {
      nextFieldErrors.redirectURL = "Redirect URL must be a valid URL.";
    }

    if (!trimmedLogoutURL) {
      nextFieldErrors.logoutURL = "Logout URL is required.";
    } else if (!isValidHttpUrl(trimmedLogoutURL)) {
      nextFieldErrors.logoutURL = "Logout URL must be a valid URL.";
    }

    setFieldErrors(nextFieldErrors);

    const firstError =
      nextFieldErrors.baseURL ||
      nextFieldErrors.redirectURL ||
      nextFieldErrors.logoutURL;

    if (firstError) {
      setError(firstError);
      return false;
    }

    return true;
  };

  const toggleGrant = (grant) => {
    if (grants.includes(grant)) {
      setGrants(grants.filter((value) => value !== grant));
    } else {
      setGrants([...grants, grant]);
    }

    if (error) {
      setError("");
    }
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const message = "System logo must be a PNG or JPG file.";
      setFieldErrors((current) => ({
        ...current,
        imageFile: message,
      }));
      setError(message);
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      const message = "System logo must be 5MB max.";
      setFieldErrors((current) => ({
        ...current,
        imageFile: message,
      }));
      setError(message);
      return;
    }

    clearFieldError("imageFile");
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
    clearFieldError("imageFile");

    const input = document.getElementById("dropzone-file-create");
    if (input) {
      input.value = "";
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateBasicInfo()) {
      return;
    }

    if (step === 2 && !validateUrls()) {
      return;
    }

    if (step === 3 && grants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) {
      setStep(1);
      return;
    }

    if (!validateUrls()) {
      setStep(2);
      return;
    }
    if (grants.length === 0) {
      setError("At least one grant must be selected.");
      setStep(3);
      return;
    }

    setError("");

    try {
      await onSubmit({
        name,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        grants,
        imageFile,
      });
      onClose();
    } catch (submitError) {
      console.error("Create app client error:", submitError);
      setError(
        "Unable to create app client. Please review the details and try again.",
      );
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <dialog open className={modalOverlayClassName}>
        <div className={modalBoxClassName}>
          <div className={modalHeaderClassName}>
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-2xl pb-5 sm:pb-10">
                <h3 className={modalHeaderTitleClassName}>
                  Create App Client
                </h3>
                <p className={modalHeaderDescriptionClassName}>
                  Register a new application for integration.
                </p>
              </div>

              <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={modalBodyClassName}>
            <div className={modalBodyStackClassName}>
              <div className={modalStepsWrapClassName}>
                <ModalSteps currentStep={step}
                  colorMode={colorMode}
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
                  <section className={modalSectionClassName}>
                    <label className={modalLabelClassName}>
                      System Logo <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={getDropzoneClassName({
                        isDragging,
                        hasError: Boolean(fieldErrors.imageFile),
                        isDarkMode,
                      })}
                    >
                      {!imagePreview ? (
                        <label htmlFor="dropzone-file-create" className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                          <div className="space-y-3">
                            <div className={uploadIconWrapClassName}>
                              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                              </svg>
                            </div>
                            <div>
                              <p className={uploadTitleClassName}>
                                Click to upload
                              </p>
                              <p className={uploadSubtitleClassName}>
                                or drag and drop
                              </p>
                              <p className={uploadHintClassName}>
                                PNG or JPG | Max 5MB
                              </p>
                            </div>
                          </div>
                          <input id="dropzone-file-create" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange}/>
                        </label>
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center">
                          <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-[1.25rem] object-contain shadow-[0_24px_45px_-30px_rgba(43,3,7,0.45)] transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                          <button type="button" onClick={removeImage} className={previewRemoveButtonClassName}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {fieldErrors.imageFile && (
                      <p className={inlineErrorClassName}>
                        {fieldErrors.imageFile}
                      </p>
                    )}
                  </section>

                  <section className={modalSectionClassName}>
                    <SpeechInputToolbar
                      activeFieldLabel={activeVoiceFieldLabel}
                      onError={setError}
                      onTranscript={handleVoiceInput}
                      colorMode={colorMode}
                    />

                    <div>
                      <label className={modalLabelClassName}>
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        maxLength={100}
                        value={name}
                        onChange={(event) =>
                          updateFieldValue("name", event.target.value, setName)
                        }
                        onFocus={() => setActiveVoiceField("name")}
                        placeholder="(e.g., Identity Provider System)"
                        className={getInputClassName("name")}
                      />
                      {fieldErrors.name && (
                        <p className={inlineErrorClassName}>
                          {fieldErrors.name}
                        </p>
                      )}
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be 5-100 characters
                      </p>
                    </div>

                    <div className="mt-5">
                      <label className={modalLabelClassName}>
                        Description
                      </label>
                      <textarea value={description} onChange={(event) => setDescription(event.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Short description of the application (optional)" className={textareaClassName}/>
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <section className={modalSectionClassName}>
                    <div className="space-y-5">
                      <SpeechInputToolbar
                        activeFieldLabel={activeVoiceFieldLabel}
                        onError={setError}
                        onTranscript={handleVoiceInput}
                        colorMode={colorMode}
                      />

                      <div>
                        <label className={modalLabelClassName}>
                          Base URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={baseURL}
                          onChange={(event) =>
                            updateFieldValue(
                              "baseURL",
                              event.target.value,
                              setBaseURL,
                            )
                          }
                          onFocus={() => setActiveVoiceField("baseURL")}
                          placeholder="https://app.example.com"
                          className={getInputClassName("baseURL")}
                          pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$"
                          title="Must be valid URL"
                        />
                        {fieldErrors.baseURL && (
                          <p className={inlineErrorClassName}>
                            {fieldErrors.baseURL}
                          </p>
                        )}
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>
                        Redirect URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={redirectURL}
                        onChange={(event) =>
                          updateFieldValue(
                            "redirectURL",
                            event.target.value,
                            setRedirectURL,
                          )
                        }
                        onFocus={() => setActiveVoiceField("redirectURL")}
                        placeholder="https://app.example.com/callback"
                        className={getInputClassName("redirectURL")}
                        pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$"
                        title="Must be valid URL"
                      />
                      {fieldErrors.redirectURL && (
                        <p className={inlineErrorClassName}>
                          {fieldErrors.redirectURL}
                        </p>
                      )}
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>
                        Logout URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={logoutURL}
                        onChange={(event) =>
                          updateFieldValue(
                            "logoutURL",
                            event.target.value,
                            setLogoutURL,
                          )
                        }
                        onFocus={() => setActiveVoiceField("logoutURL")}
                        placeholder="https://app.example.com/logout"
                        className={getInputClassName("logoutURL")}
                        pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$"
                        title="Must be valid URL"
                      />
                      {fieldErrors.logoutURL && (
                        <p className={inlineErrorClassName}>
                          {fieldErrors.logoutURL}
                        </p>
                      )}
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className={modalSectionClassName}>
                  <label className={modalLabelClassName}>
                    Grants <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {GRANT_OPTIONS.map((grant) => {
                      const isSelected = grants.includes(grant);

                      return (
                        <label key={grant}
                          className={getGrantClassName({
                            isSelected,
                            isDarkMode,
                          })}
                        >
                          <input type="checkbox" name="grants" value={grant} className={grantCheckboxClassName} checked={isSelected} onChange={() => toggleGrant(grant)} required={grants.length === 0} title="Required"/>
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
                  <p className={`${modalHelperTextClassName} mt-4`}>
                    Allowed roles are managed by the finalized backend after the
                    client is created.
                  </p>
                </section>
              )}
            </div>
          </div>

          <div className={modalFooterClassName}>
            <div className={modalFooterActionsClassName}>
              {step === 1 ? (
                <button type="button" onClick={onClose} className={modalSecondaryButtonClassName}>
                  Close
                </button>
              ) : (
                <button type="button" onClick={() => setStep(step - 1)} className={modalSecondaryButtonClassName}>
                  Back
                </button>
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className={modalPrimaryButtonClassName}>
                  Next
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className={modalPrimaryButtonClassName}>
                  Create Client
                </button>
              )}
            </div>
          </div>
        </div>
      </dialog>

      {showFullImage && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-6" onClick={() => setShowFullImage(false)}>
          <div className={fullImageBackdropClassName} />
          <div className="relative pointer-events-none flex max-w-4xl items-center justify-center">
            <button type="button" className={`${getImagePreviewCloseButtonClassName(isDarkMode)} pointer-events-auto`} onClick={() => setShowFullImage(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <img src={imagePreview} className={fullImageClassName} alt="Full Preview"/>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}