import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatTimestamp } from "../../../utils/formatTimestamp";

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

const sanitizeProfile = (profileData = {}) => ({
  ...profileData,
  firstName: (profileData.firstName || "").trim(),
  middleName: (profileData.middleName || "").trim(),
  lastName: (profileData.lastName || "").trim(),
  suffix: (profileData.suffix || "").trim(),
  email: (profileData.email || "").trim(),
});

function validateProfile(profile, allowEmailEdit) {
  const nextFieldErrors = { ...initialFieldErrors };

  if (!profile.firstName.trim()) {
    nextFieldErrors.firstName = "First name is required.";
  }

  if (!profile.lastName.trim()) {
    nextFieldErrors.lastName = "Last name is required.";
  }

  if (allowEmailEdit) {
    if (!profile.email.trim()) {
      nextFieldErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }
  }

  return nextFieldErrors;
}

function getProfileUpdateErrorMessage(error) {
  const responseMessage =
    error?.response?.data?.error || error?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage.trim();
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Unable to update profile right now. Please try again.";
}

export function useEditProfileModal({ open, onClose, profileData, updateProfile, addAuditLog, allowEmailEdit }) {
  const [profile, setProfile] = useState(createProfileState());
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [activeVoiceField, setActiveVoiceField] = useState("firstName");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFieldErrors(initialFieldErrors);
    setErrorMessage("");
    setProfile(createProfileState(profileData));
    setActiveVoiceField("firstName");
    setIsSaving(false);
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

  const handleVoiceInput = (transcript) => {
    updateProfileField(activeVoiceField, transcript);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const nextProfile = sanitizeProfile(profile);
    const nextFieldErrors = validateProfile(nextProfile, allowEmailEdit);
    const firstError =
      nextFieldErrors.firstName ||
      nextFieldErrors.lastName ||
      nextFieldErrors.email;

    setProfile(nextProfile);
    setFieldErrors(nextFieldErrors);

    if (firstError) {
      setErrorMessage(firstError);
      return;
    }

    try {
      setIsSaving(true);

      if (updateProfile) {
        await updateProfile(nextProfile);
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
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(getProfileUpdateErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    fieldErrors,
    activeVoiceField,
    setActiveVoiceField,
    errorMessage,
    setErrorMessage,
    isSaving,
    handleChange,
    handleVoiceInput,
    handleSubmit,
  };
}
