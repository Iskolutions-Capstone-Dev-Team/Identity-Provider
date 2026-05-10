import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import AppClientIconBox from "./AppClientIconBox";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

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

const getDropzoneClassName = ({ hasError, isDragging, isView, isDarkMode }) =>
  `${getDropzoneBaseClassName(isDarkMode)} ${
    hasError && !isView
      ? isDarkMode
        ? "border-red-400 bg-[linear-gradient(180deg,rgba(60,15,20,0.72),rgba(35,18,26,0.9))]"
        : "border-red-400 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,244,0.94))]"
      : isDragging && !isView
        ? isDarkMode
          ? "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(123,13,21,0.2),rgba(32,22,30,0.92))]"
          : "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(255,247,220,0.92),rgba(255,244,220,0.84))]"
        : isView
          ? isDarkMode
            ? "border-white/10"
            : "border-[#7b0d15]/10"
          : isDarkMode
            ? "border-white/10 hover:border-[#f8d24e]/45 hover:bg-[linear-gradient(180deg,rgba(14,20,33,0.82),rgba(30,20,30,0.92))]"
            : "border-[#7b0d15]/12 hover:border-[#f8d24e]/65 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,238,0.94))]"
  }`;

const getGrantClassName = ({ isSelected, isView, isDarkMode }) =>
  `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
    isSelected
      ? isDarkMode
        ? "border-[#f8d24e]/35 bg-[#f8d24e]/12 text-[#ffe28a]"
        : "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
      : isDarkMode
        ? "border-white/10 bg-white/[0.04] text-[#d6c3c7]"
        : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41]"
  } ${
    isView
      ? "cursor-default"
      : isDarkMode
        ? "hover:border-[#f8d24e]/35 hover:bg-[#f8d24e]/10"
        : "hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"
  }`;

export default function AppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
  const isView = mode === "view";
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalInputClassName,
    modalLabelClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [selectedGrants, setSelectedGrants] = useState(["authorization_code"]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const detailsRequestRef = useRef({ clientId: "", inFlight: false });
  const detailsBannerClassName = isDarkMode
    ? "rounded-[1rem] border border-[#f8d24e]/30 bg-[#f8d24e]/10 px-4 py-3 text-sm text-[#ffe28a]"
    : "rounded-[1rem] border border-[#f8d24e]/45 bg-[#fff4dc] px-4 py-3 text-sm text-[#7b0d15]";
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
  const viewContentBoxClassName = isDarkMode
    ? "min-h-24 w-full rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-3 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-3 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
  const emptyContentClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";
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
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const modalHeaderContentClassName =
    "flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;

  const resolveImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith("data:")) return image;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${image}`;
  };

  useEffect(() => {
    if (!open || !client) return;

    setName(client.name || "");
    setDescription(client.description || "");
    setBaseURL(client.base_url || "");
    setRedirectURL(client.redirect_uri || "");
    setLogoutURL(client.logout_uri || "");
    setSelectedGrants(client.grants || ["authorization_code"]);
    setImageFile(null);
    setIsDragging(false);
    setActiveVoiceField("name");
    setError("");
    setFieldErrors(initialFieldErrors);

    const image = client.image || client.image_location || null;
    setImageLocation(image || "");
    setImagePreview(resolveImageSrc(image));
  }, [client, open]);

  useEffect(() => {
    if (!shouldRender) {
      detailsRequestRef.current = { clientId: "", inFlight: false };
      setActiveVoiceField("name");
      setFieldErrors(initialFieldErrors);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!open || !client || typeof getClientDetails !== "function") return;

    const clientId = client.id || client.clientId;
    if (!clientId) return;
    if (
      detailsRequestRef.current.inFlight &&
      detailsRequestRef.current.clientId === clientId
    ) {
      return;
    }

    let cancelled = false;
    detailsRequestRef.current = { clientId, inFlight: true };
    setIsDetailsLoading(true);
    setError("");

    getClientDetails(clientId)
      .then((details) => {
        if (cancelled || !details) return;

        setName(details.name || "");
        setDescription(details.description || "");
        setBaseURL(details.base_url || "");
        setRedirectURL(details.redirect_uri || "");
        setLogoutURL(details.logout_uri || "");
        setSelectedGrants(details.grants || ["authorization_code"]);
        setFieldErrors(initialFieldErrors);

        const image = details.image || details.image_location || null;
        setImageLocation(image || "");
        setImagePreview(resolveImageSrc(image));
      })
      .catch((fetchError) => {
        if (cancelled) return;
        console.error("Fetch client details error:", fetchError);
        setError("Unable to load latest app client details.");
      })
      .finally(() => {
        detailsRequestRef.current = { clientId, inFlight: false };
        if (!cancelled) {
          setIsDetailsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, getClientDetails, open]);

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

  const getEditableInputClassName = (fieldName) =>
    `${modalInputClassName} ${
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

  const validateEditableFields = () => {
    const trimmedName = name.trim();
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const nextFieldErrors = { ...initialFieldErrors };
    const hasLogo = Boolean(imageFile) || Boolean(imageLocation);

    if (!hasLogo) {
      nextFieldErrors.imageFile = "System logo is required.";
    }

    if (!trimmedName) {
      nextFieldErrors.name = "Client name is required.";
    } else if (trimmedName.length < 5 || trimmedName.length > 100) {
      nextFieldErrors.name = "Client name must be between 5 and 100 characters.";
    }

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
      nextFieldErrors.imageFile ||
      nextFieldErrors.name ||
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
    if (selectedGrants.includes(grant)) {
      setSelectedGrants(selectedGrants.filter((value) => value !== grant));
    } else {
      setSelectedGrants([...selectedGrants, grant]);
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
    if (!isView) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isView) {
      validateAndProcessFile(event.dataTransfer.files?.[0]);
    }
  };

  const removeImage = (event) => {
    event.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    setImageLocation("");
    clearFieldError("imageFile");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isView) {
      onClose();
      return;
    }

    if (!validateEditableFields()) {
      return;
    }

    if (!selectedGrants || selectedGrants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        id: client?.id || client?.clientId,
        name,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        grants: selectedGrants,
        imageFile,
      });

      onClose();
    } catch (submitError) {
      console.error("Submit app client error:", submitError);
      setError(
        submitError?.message ||
          "Unable to save app client. Please review the details and try again.",
      );
    }
  };

  if (!shouldRender) return null;

  const renderSectionHeader = (title, description, isRequired = false) => (
    <div className={sectionHeaderClassName}>
      <label className={modalLabelClassName}>
        {title} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <p className={sectionDescriptionClassName}>
        {description}
      </p>
    </div>
  );

  return createPortal(
    <>
      <dialog open
        className={getModalTransitionClassName(
          modalOverlayClassName,
          isClosing,
        )}
      >
        <div className={modalBoxClassName}>
          <div className={modalHeaderSpacingClassName}>
            <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
              <div className={modalHeaderContentClassName}>
                <AppClientIconBox colorMode={colorMode} variant="plain" />
                <h3 className={modalHeaderTitleClassName}>
                  {isView ? "View App Client" : "Edit App Client"}
                </h3>
              </div>

              <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <form id="app-client-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
            <div className={modalBodyStackClassName}>
              <ErrorAlert message={error} onClose={() => setError("")} />

              {isDetailsLoading && (
                <div className={detailsBannerClassName}>
                  Loading latest app client details...
                </div>
              )}

              <section className={modalSectionClassName}>
                {renderSectionHeader(
                  "System Logo",
                  isView
                    ? "View the app client's system logo."
                    : "Update the app client's system logo.",
                  !isView,
                )}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={getDropzoneClassName({
                    hasError: Boolean(fieldErrors.imageFile),
                    isDragging,
                    isView,
                    isDarkMode,
                  })}
                >
                  {!imagePreview ? (
                    <label htmlFor="dropzone-file" className={`flex h-full w-full flex-col items-center justify-center ${
                        isView ? "cursor-default" : "cursor-pointer"
                      }`}>
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
                      <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={isView}/>
                    </label>
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-[1.25rem] object-contain shadow-[0_24px_45px_-30px_rgba(43,3,7,0.45)] transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                      {!isView && (
                        <button type="button" onClick={removeImage} className={previewRemoveButtonClassName}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {!isView && fieldErrors.imageFile && (
                  <p className={inlineErrorClassName}>
                    {fieldErrors.imageFile}
                  </p>
                )}
              </section>

              <section className={modalSectionClassName}>
                {renderSectionHeader(
                  "Client Details",
                  isView
                    ? "View the app client's basic details."
                    : "Update the app client's name and description.",
                )}
                <div className="space-y-5">
                  <div>
                    <label className={modalLabelClassName}>Client Id</label>
                    <input type="text" value={client?.id || client?.clientId || ""} readOnly className={modalReadOnlyInputClassName}/>
                  </div>

                  {!isView && (
                    <SpeechInputToolbar
                      activeFieldLabel={activeVoiceFieldLabel}
                      onError={setError}
                      onTranscript={handleVoiceInput}
                      colorMode={colorMode}
                    />
                  )}

                  <div>
                    <label className={modalLabelClassName}>
                      Name {!isView && <span className="text-red-500">*</span>}
                    </label>
                    {isView ? (
                      <input type="text" required minLength={5} maxLength={100} value={name} onChange={(event) => updateFieldValue("name", event.target.value, setName)} placeholder="(e.g., Identity Provider System)"
                        className={modalReadOnlyInputClassName}
                        disabled={isView}
                      />
                    ) : (
                      <input type="text" required minLength={5} maxLength={100} value={name} onChange={(event) => updateFieldValue("name", event.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)"
                        className={getEditableInputClassName("name")}
                        disabled={isView}
                      />
                    )}
                    {!isView && fieldErrors.name && (
                      <p className={inlineErrorClassName}>
                        {fieldErrors.name}
                      </p>
                    )}
                    {!isView && (
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be 5-100 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={modalLabelClassName}>Description</label>
                    {isView ? (
                      <div className={viewContentBoxClassName}>
                        {description?.trim() ? (
                          description
                        ) : (
                          <span className={emptyContentClassName}>No content</span>
                        )}
                      </div>
                    ) : (
                      <textarea value={description} onChange={(event) => setDescription(event.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Application description" className={textareaClassName}/>
                    )}
                  </div>
                </div>
              </section>

              <section className={modalSectionClassName}>
                {renderSectionHeader(
                  "Application URLs",
                  isView
                    ? "View the configured application URLs."
                    : "Update the base, redirect, and logout URLs.",
                )}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={modalLabelClassName}>
                      Base URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={baseURL} onChange={(event) => updateFieldValue("baseURL", event.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com"
                      className={
                        isView
                          ? modalReadOnlyInputClassName
                          : getEditableInputClassName("baseURL")
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && fieldErrors.baseURL && (
                      <p className={inlineErrorClassName}>
                        {fieldErrors.baseURL}
                      </p>
                    )}
                    {!isView && (
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={modalLabelClassName}>
                      Redirect URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={redirectURL} onChange={(event) => updateFieldValue("redirectURL", event.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback"
                      className={
                        isView
                          ? modalReadOnlyInputClassName
                          : getEditableInputClassName("redirectURL")
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && fieldErrors.redirectURL && (
                      <p className={inlineErrorClassName}>
                        {fieldErrors.redirectURL}
                      </p>
                    )}
                    {!isView && (
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 md:mx-auto md:w-1/2">
                    <label className={modalLabelClassName}>
                      Logout URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={logoutURL} onChange={(event) => updateFieldValue("logoutURL", event.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout"
                      className={
                        isView
                          ? modalReadOnlyInputClassName
                          : getEditableInputClassName("logoutURL")
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && fieldErrors.logoutURL && (
                      <p className={inlineErrorClassName}>
                        {fieldErrors.logoutURL}
                      </p>
                    )}
                    {!isView && (
                      <p className={`${modalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className={modalSectionClassName}>
                <div className="space-y-5">
                  <div>
                    {renderSectionHeader(
                      "Grants",
                      isView
                        ? "View the grant types enabled for this client."
                        : "Select the grant types required for this client.",
                      !isView,
                    )}
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {GRANT_OPTIONS.map((grant) => {
                        const isSelected = selectedGrants.includes(grant);

                        return (
                          <label key={grant}
                            className={getGrantClassName({
                              isSelected,
                              isView,
                              isDarkMode,
                            })}
                          >
                            <input type="checkbox" name="grants" value={grant} className={grantCheckboxClassName} checked={isSelected} onChange={() => toggleGrant(grant)} disabled={isView} required={!isView && selectedGrants.length === 0} title="Required"/>
                            <span className="break-all">{grant}</span>
                          </label>
                        );
                      })}
                    </div>
                    {!isView && selectedGrants.length === 0 && (
                      <p className="mt-3 text-xs text-red-500">
                        At least one grant is required.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </form>

          <div className={modalFooterClassName}>
            <div className={modalFooterActionsClassName}>
              <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
                Cancel
              </button>

              {!isView && (
                <button form="app-client-form" type="submit" disabled={isDetailsLoading} className={modalPrimaryButtonClassName}>
                  {mode === "create" ? "Create" : "Save"}
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