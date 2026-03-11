import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "../ChangePasswordModal";
import ProfileDetails from "./ProfileDetails";
import EmailStatus from "./EmailStatus";
import ActionButtons from "./ActionButtons";
import SuccessAlert from "../SuccessAlert";

export default function ProfileCard({ profile, addAuditLog, allowEmailEdit = false }) {
    const [isEditOpen, setEditOpen] = useState(false);
    const [isPasswordOpen, setPasswordOpen] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        setCurrentProfile(profile);
    }, [profile]);

    const handleProfileUpdate = (updatedProfile) => {
        setCurrentProfile(updatedProfile);
        setToastMessage("Profile updated successfully!");
        setTimeout(() => setToastMessage(""), 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold">
                            {`${currentProfile.firstName} ${currentProfile.middleName ? currentProfile.middleName + " " : ""}${currentProfile.lastName}`}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                            <span className="badge badge-md rounded-xl text-xs md:text-base bg-white/20 border-0 text-white px-4 py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                {currentProfile.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <ProfileDetails profile={currentProfile}/>
                <EmailStatus allowEmailEdit={allowEmailEdit}/>
                <ActionButtons 
                    openEdit={() => setEditOpen(true)}
                    openPassword={() => setPasswordOpen(true)}
                />
            </div>
            <EditProfileModal 
                open={isEditOpen} 
                close={() => setEditOpen(false)}
                profileData={currentProfile} 
                updateProfile={handleProfileUpdate}
                addAuditLog={addAuditLog} 
                allowEmailEdit={allowEmailEdit}
            />
            <ChangePasswordModal 
                isOpen={isPasswordOpen}
                onClose={() => setPasswordOpen(false)}
                showCurrentPassword={true}
                addAuditLog={addAuditLog}
                setToastMessage={setToastMessage}
                enableSuccessAlert={false}
            />
            <SuccessAlert 
                message={toastMessage}
                onClose={() => setToastMessage("")}
            />
        </div>
    );
}
