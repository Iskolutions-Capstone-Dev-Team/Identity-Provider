import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import EmailStatus from "./EmailStatus";
import ActionButtons from "./ActionButtons";
import SuccessAlert from "../SuccessAlert";
import { userService } from "../../services/userService";

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
  const [toastMessage, setToastMessage] = useState("");

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
    setToastMessage("Profile updated successfully!");
    setTimeout(() => setToastMessage(""), 2000);
  };

  const profileName = formatProfileName(currentProfile) || "Profile";
  const profileInitials = getProfileInitials(currentProfile);
  const wrapperClassName = `relative overflow-hidden rounded-[2rem] backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 ease-out ${
    isDarkMode
      ? "border border-white/10 shadow-[0_32px_90px_-54px_rgba(2,6,23,0.9)]"
      : "border border-white/70 shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)]"
  }`;

  return (
    <>
      <div className={wrapperClassName}>
        <div
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] transition-opacity duration-500 ease-out ${
            isDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(33,21,30,0.92))] transition-opacity duration-500 ease-out ${
            isDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_24%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_38%)] transition-opacity duration-500 ease-out ${
            isDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.12),transparent_24%),linear-gradient(180deg,rgba(123,13,21,0.1),transparent_38%)] transition-opacity duration-500 ease-out ${
            isDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative">
          <div className="relative overflow-hidden border-b border-white/10 px-5 py-6 text-white sm:px-8 sm:py-7">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}
            />
            <div
              className={`absolute inset-0 bg-[linear-gradient(135deg,rgba(43,3,7,0.94),rgba(123,13,21,0.84),rgba(24,2,4,0.96))] transition-opacity duration-500 ease-out ${
                isDarkMode ? "opacity-0" : "opacity-100"
              }`}
            />
            <div
              className={`absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(123,13,21,0.76),rgba(31,18,27,0.96))] transition-opacity duration-500 ease-out ${
                isDarkMode ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="pointer-events-none absolute inset-0">
              <div
                className={`absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[#f8d24e]/20 blur-3xl transition-opacity duration-500 ease-out ${
                  isDarkMode ? "opacity-0" : "opacity-100"
                }`}
              />
              <div
                className={`absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[#f8d24e]/14 blur-3xl transition-opacity duration-500 ease-out ${
                  isDarkMode ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className={`absolute bottom-[-5rem] right-[-1rem] h-52 w-52 rounded-full bg-white/10 blur-3xl transition-opacity duration-500 ease-out ${
                  isDarkMode ? "opacity-0" : "opacity-100"
                }`}
              />
              <div
                className={`absolute bottom-[-5rem] right-[-1rem] h-52 w-52 rounded-full bg-[#7b0d15]/20 blur-3xl transition-opacity duration-500 ease-out ${
                  isDarkMode ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.75rem] border border-white/12 bg-white/10 text-xl font-semibold tracking-[0.08em] text-white shadow-[0_22px_45px_-28px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:h-20 sm:w-20 sm:text-2xl">
                  {profileInitials}
                </div>

                <div className="min-w-0 space-y-3">
                  <h2 className="text-2xl font-semibold tracking-[0.01em] text-white sm:text-[2.1rem]">
                    {profileName}
                  </h2>
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/88 backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-4 w-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                    </svg>
                    <span className="truncate">{currentProfile.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <ProfileDetails profile={currentProfile} colorMode={colorMode} />
            <EmailStatus colorMode={colorMode} />
            <ActionButtons
              openEdit={() => setEditOpen(true)}
              openPassword={() => setPasswordOpen(true)}
              colorMode={colorMode}
            />
          </div>
        </div>
      </div>

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
        setToastMessage={setToastMessage}
        enableSuccessAlert={false}
        colorMode={colorMode}
      />
      <SuccessAlert
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </>
  );
}