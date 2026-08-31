import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useEditProfileModal } from "../hooks/useEditProfileModal";

import { SUFFIX_OPTIONS } from "../../../utils/suffixOptions";

export default function EditProfileModal({ open, onClose, profileData, updateProfile, addAuditLog, allowEmailEdit = false, colorMode = "light" }) {
  const modalState = useEditProfileModal({
    open,
    onClose,
    profileData,
    updateProfile,
    addAuditLog,
    allowEmailEdit,
  });

  const {
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
  } = modalState;

  const activeVoiceFieldLabel =
    activeVoiceField === "lastName"
      ? "Last Name"
      : activeVoiceField === "suffix"
        ? "Suffix"
        : activeVoiceField === "middleName"
          ? "Middle Name"
          : "First Name";

  if (!open) {
    return null;
  }

  const isDarkMode = colorMode === "dark";
  const fieldErrorClassName = "!mt-0 text-xs text-destructive";
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

            {allowEmailEdit && (
              <Field className="mb-6 gap-0 space-y-1.5">
                <FieldLabel htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </FieldLabel>
                <Input type="email" id="email" name="email" value={profile.email} onChange={handleChange} placeholder="Enter email" className="h-10 rounded-lg" disabled={isSaving} aria-invalid={!!fieldErrors.email} />
                {fieldErrors.email ? (
                  <FieldError>{fieldErrors.email}</FieldError>
                ) : (
                  <p className={`${helperTextClassName}`}>
                    Must be an active email account
                  </p>
                )}
              </Field>
            )}


              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center min-h-[24px]">
                    <Label>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Input type="text" name="firstName" value={profile.firstName} onChange={handleChange} onFocus={() => setActiveVoiceField("firstName")} placeholder="Enter first name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving} />
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
                  <Input type="text" name="middleName" value={profile.middleName} onChange={handleChange} onFocus={() => setActiveVoiceField("middleName")} placeholder="Enter middle name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center min-h-[24px]">
                    <Label>
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <Input type="text" name="lastName" value={profile.lastName} onChange={handleChange} onFocus={() => setActiveVoiceField("lastName")} placeholder="Enter last name" maxLength={50} className="h-10 rounded-lg" disabled={isSaving} />
                  {fieldErrors.lastName && (
                    <p className={fieldErrorClassName}>{fieldErrors.lastName}</p>
                  )}
                </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between min-h-[24px]">
                      <Label>Suffix</Label>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#7b0d15]/30 text-[#7b0d15] dark:border-[#f8d24e]/30 dark:text-[#ffe28a] tracking-wider bg-[#7b0d15]/5 dark:bg-[#f8d24e]/10">Optional</span>
                    </div>
                    <Select value={profile.suffix} onValueChange={(val) => handleChange({ target: { name: "suffix", value: val === "N/A" ? "" : val } })} disabled={isSaving}>
                      <SelectTrigger className="!h-10 w-full rounded-lg">
                        <span className={`truncate text-sm ${profile.suffix ? "text-foreground" : "text-muted-foreground"}`}>
                          <SelectValue placeholder="Enter suffix" />
                        </span>
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false} className="max-h-[300px]">
                        <SelectGroup>
                          {SUFFIX_OPTIONS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
            </div>
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