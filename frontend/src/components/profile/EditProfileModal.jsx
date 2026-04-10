import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { formatTimestamp } from "../../utils/formatTimestamp";
import { getModalTheme } from "../modalTheme";

const initialFieldErrors = {
  firstName: "",
  lastName: "",
  email: "",
};

const createProfileState = (profileData = {}) => ({
  ...profileData,
  firstName: profileData.firstName || "",
  middleName: profileData.middleName || "",
  lastName: profileData.lastName || "",
  suffix: profileData.suffix || "",
  email: profileData.email || "",
});

function validateProfile(profile, allowEmailEdit) {
  const nextFieldErrors = { ...initialFieldErrors };

  if (!profile.firstName.trim()) {
    nextFieldErrors.firstName = "First name is required.";
  }

  if (!profile.lastName.trim()) {
    nextFieldErrors.lastName = "Last name is required.";
  }

  if (allowEmailEdit && !profile.email.trim()) {
    nextFieldErrors.email = "Email is required.";
  }

  return nextFieldErrors;
}

export default function EditProfileModal({ open, onClose, profileData, updateProfile, addAuditLog, allowEmailEdit = false, colorMode = "light" }) {
  const [profile, setProfile] = useState(createProfileState());
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [activeVoiceField, setActiveVoiceField] = useState("firstName");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setFieldErrors(initialFieldErrors);
    setErrorMessage("");
    setProfile(createProfileState(profileData));
    setActiveVoiceField("firstName");
  }, [open, profileData]);

  const updateProfileField = (name, value) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));

    setFieldErrors((currentErrors) =>
      currentErrors[name]
        ? {
            ...currentErrors,
            [name]: "",
          }
        : currentErrors,
    );

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateProfileField(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextFieldErrors = validateProfile(profile, allowEmailEdit);
    const firstError =
      nextFieldErrors.firstName ||
      nextFieldErrors.lastName ||
      nextFieldErrors.email;

    setFieldErrors(nextFieldErrors);

    if (firstError) {
      setErrorMessage(firstError);
      return;
    }

    if (updateProfile) {
      updateProfile(profile);
    }

    if (addAuditLog) {
      addAuditLog({
        timestamp: formatTimestamp(new Date().toISOString()),
        action: "PROFILE_UPDATE",
        details: "Updated profile information",
        color: "blue",
      });
    }

    onClose();
  };

  const activeVoiceFieldLabel =
    activeVoiceField === "lastName"
      ? "Last Name"
      : activeVoiceField === "suffix"
        ? "Suffix"
      : activeVoiceField === "middleName"
        ? "Middle Name"
        : "First Name";

  const handleVoiceInput = (transcript) => {
    updateProfileField(activeVoiceField, transcript);
  };

  if (!open) {
    return null;
  }

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
  } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const fieldErrorClassName = isDarkMode
    ? "mt-2 text-xs text-red-300"
    : "mt-2 text-xs text-red-500";
  const requiredNoteClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#8f6f76]";
  const getInputClassName = (hasError) =>
    `${modalInputClassName} ${hasError ? "border-red-400 focus:border-red-500" : ""}`;

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={`${modalHeaderClassName} !pb-6 sm:!pb-7`}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>Edit Profile</h3>
              <p className={modalHeaderDescriptionClassName}>
                Update your personal information.
              </p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form id="edit-profile-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <ErrorAlert
              message={errorMessage}
              onClose={() => setErrorMessage("")}
            />

            <section className={modalSectionClassName}>
              <SpeechInputToolbar
                activeFieldLabel={activeVoiceFieldLabel}
                onError={setErrorMessage}
                onTranscript={handleVoiceInput}
                colorMode={colorMode}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className={modalLabelClassName}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} onFocus={() => setActiveVoiceField("firstName")} placeholder="Enter first name" maxLength={50} className={getInputClassName(Boolean(fieldErrors.firstName))}/>
                  {fieldErrors.firstName ? (
                    <p className={fieldErrorClassName}>
                      {fieldErrors.firstName}
                    </p>
                  ) : (
                    <p className={`${modalHelperTextClassName} mt-2`}>
                      Max 50 characters
                    </p>
                  )}
                </div>

                <div>
                  <label className={modalLabelClassName}>Middle Name</label>
                  <input type="text"  name="middleName" value={profile.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middle name" maxLength={50} className={modalInputClassName}/>
                </div>

                <div>
                  <label className={modalLabelClassName}>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} onFocus={() => setActiveVoiceField("lastName")} placeholder="Enter last name" maxLength={50} className={getInputClassName(Boolean(fieldErrors.lastName))}/>
                  {fieldErrors.lastName ? (
                    <p className={fieldErrorClassName}>{fieldErrors.lastName}</p>
                  ) : (
                    <p className={`${modalHelperTextClassName} mt-2`}>
                      Max 50 characters
                    </p>
                  )}
                </div>

                <div>
                  <label className={modalLabelClassName}>Suffix</label>
                  <input type="text" name="suffix" value={profile.suffix} onChange={handleChange} onFocus={() => setActiveVoiceField("suffix")} placeholder="Enter suffix" maxLength={20} className={modalInputClassName}/>
                  <p className={`${modalHelperTextClassName} mt-2`}>Optional</p>
                </div>
              </div>
            </section>

            {allowEmailEdit && (
              <section className={modalSectionClassName}>
                <div>
                  <label className={modalLabelClassName}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter email" className={getInputClassName(Boolean(fieldErrors.email))}/>
                  {fieldErrors.email ? (
                    <p className={fieldErrorClassName}>{fieldErrors.email}</p>
                  ) : (
                    <p className={`${modalHelperTextClassName} mt-2`}>
                      Must be an active email account
                    </p>
                  )}
                </div>
              </section>
            )}

            <div className={requiredNoteClassName}>
              Fields marked with <span className="text-red-500">*</span> are
              required
            </div>
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              Cancel
            </button>

            <button form="edit-profile-form" type="submit" className={modalPrimaryButtonClassName}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}