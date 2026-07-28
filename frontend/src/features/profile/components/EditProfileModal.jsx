import { useEffect, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  if (allowEmailEdit && !profile.email.trim()) {
    nextFieldErrors.email = "Email is required.";
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

export default function EditProfileModal({ open, onClose, profileData, updateProfile, addAuditLog, allowEmailEdit = false, colorMode = "light" }) {
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
      setErrorMessage(getProfileUpdateErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
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

  const isDarkMode = colorMode === "dark";
  const fieldErrorClassName = "!mt-0 text-xs text-destructive";
  const requiredNoteClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#8f6f76]";

  const helperTextClassName = "text-sm text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">


          <form id="edit-profile-form" noValidate onSubmit={handleSubmit} className="space-y-6 px-2 pb-6">
            <div className="space-y-4">
              <SpeechInputToolbar
                activeFieldLabel={activeVoiceFieldLabel}
                onError={setErrorMessage}
                onTranscript={handleVoiceInput}
                colorMode={colorMode}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center min-h-[24px]">
                    <Label>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Input type="text" name="firstName" value={profile.firstName} onChange={handleChange} onFocus={() => setActiveVoiceField("firstName")} placeholder="Enter first name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving}/>
                  {fieldErrors.firstName && (
                    <p className={fieldErrorClassName}>
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center min-h-[24px]">
                    <Label>Middle Name</Label>
                  </div>
                  <Input type="text" name="middleName" value={profile.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middle name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving}/>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center min-h-[24px]">
                    <Label>
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Input type="text" name="lastName" value={profile.lastName} onChange={handleChange} onFocus={() => setActiveVoiceField("lastName")} placeholder="Enter last name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving}/>
                  {fieldErrors.lastName && (
                    <p className={fieldErrorClassName}>{fieldErrors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between min-h-[24px]">
                    <Label>Suffix</Label>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#7b0d15]/30 text-[#7b0d15] dark:border-[#f8d24e]/30 dark:text-[#ffe28a] tracking-wider bg-[#7b0d15]/5 dark:bg-[#f8d24e]/10">Optional</span>
                  </div>
                  <Input type="text" name="suffix" value={profile.suffix} onChange={handleChange} onFocus={() => setActiveVoiceField("suffix")} placeholder="Enter suffix" maxLength={20} className="h-10 rounded-lg" disabled={isSaving}/>
                </div>
              </div>
            </div>

            {allowEmailEdit && (
              <div className="space-y-2">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter email" className="h-10 rounded-lg" disabled={isSaving}/>
                {fieldErrors.email ? (
                  <p className={fieldErrorClassName}>{fieldErrors.email}</p>
                ) : (
                  <p className={`${helperTextClassName} mt-2`}>
                    Must be an active email account
                  </p>
                )}
              </div>
            )}


          </form>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button form="edit-profile-form" type="submit" disabled={isSaving} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}