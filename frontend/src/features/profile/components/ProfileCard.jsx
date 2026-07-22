import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import ActionButtons from "./ActionButtons";
import { userService } from "../../../services/userService";
import { Mail } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { toast } from "sonner";

function formatProfileName(profile = {}) {
  return [profile.firstName, profile.middleName, profile.lastName, profile.suffix]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getProfileInitials(profile = {}) {
  const firstInitial = (profile.firstName || "").trim().charAt(0);
  const lastInitial = (profile.lastName || "").trim().charAt(0);
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials || "P";
}

export default function ProfileCard({ profile, updateCurrentUser, addAuditLog, allowEmailEdit = false, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const [isEditOpen, setEditOpen] = useState(false);
  const [isPasswordOpen, setPasswordOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  const handleProfileUpdate = async (updatedProfile) => {
    const profileId = updatedProfile?.id || currentProfile?.id;

    if (!profileId) {
      throw new Error("User profile is unavailable.");
    }

    await userService.updateUserName(profileId, updatedProfile);

    const nextProfile = {
      ...currentProfile,
      ...updatedProfile,
      id: profileId,
    };

    setCurrentProfile(nextProfile);
    updateCurrentUser?.(nextProfile);
    toast.success("Profile updated successfully!");
  };

  const profileName = formatProfileName(currentProfile) || "Profile";
  const profileInitials = getProfileInitials(currentProfile);
  return (
    <>
      <Card className="flex flex-col border-border bg-card shadow-sm overflow-hidden">
        <div className="px-2 py-2 sm:px-8 sm:py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar className="size-16 sm:size-20 border-none ring-0 after:hidden">
              <AvatarFallback className="bg-[#7b0d15] text-[#f8d24e] dark:bg-white dark:text-black text-xl sm:text-2xl font-bold tracking-wider border-none ring-0 outline-none">
                {profileInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1.5 sm:space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {profileName}
              </h2>
              <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground font-medium">
                <Mail className="size-4" />
                <span className="truncate">{currentProfile.email}</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="space-y-8 p-4 sm:p-6 lg:p-8">
          <ProfileDetails profile={currentProfile} colorMode={colorMode} />
          <ActionButtons
            openEdit={() => setEditOpen(true)}
            openPassword={() => setPasswordOpen(true)}
            colorMode={colorMode}
          />
        </CardContent>
      </Card>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setEditOpen(false)}
        profileData={currentProfile}
        updateProfile={handleProfileUpdate}
        addAuditLog={addAuditLog}
        allowEmailEdit={allowEmailEdit}
        colorMode={colorMode}
      />
      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setPasswordOpen(false)}
        showCurrentPassword={true}
        emailAddress={currentProfile.email}
        addAuditLog={addAuditLog}
        enableSuccessAlert={true}
        colorMode={colorMode}
      />
    </>
  );
}