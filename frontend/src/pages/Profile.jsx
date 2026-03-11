import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ProfileCard from "../components/profile/ProfileCard";
import ProfileAuditLogs from "../components/profile/AuditLogs";
import { EMPTY_CURRENT_USER } from "../hooks/useCurrentUser";

const INITIAL_AUDIT_LOGS = [
  {
    timestamp: "2024-01-20 14:25:10",
    action: "PROFILE_UPDATE",
    details: "Updated email address",
    color: "blue",
  },
  {
    timestamp: "2024-01-18 09:15:22",
    action: "LOGIN_SUCCESS",
    details: "Successful login",
    color: "green",
  },
  {
    timestamp: "2024-01-15 16:45:33",
    action: "PASSWORD_CHANGE",
    details: "Password changed",
    color: "yellow",
  },
  {
    timestamp: "2024-01-10 11:20:45",
    action: "ROLE_ASSIGNED",
    details: "Assigned student role",
    color: "purple",
  },
  {
    timestamp: "2023-08-15 10:30:45",
    action: "ACCOUNT_CREATED",
    details: "Account created",
    color: "gray",
  },
];

export default function Profile() {
  const outletContext = useOutletContext();
  const profile = outletContext?.currentUser || EMPTY_CURRENT_USER;
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);

  const handleAddAuditLog = (log) => {
    setLogs((currentLogs) => [log, ...currentLogs]);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-3 sm:px-6">
      <PageHeader
        title="Profile"
        description="View and manage your account details"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-28 h-28 text-[#991b1b]">
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        }
      />

      <div className="w-full max-w-[85vw] sm:max-w-xl lg:max-w-7xl space-y-6">
        <ProfileCard
          profile={profile}
          addAuditLog={handleAddAuditLog}
          allowEmailEdit={false}
        />
        <ProfileAuditLogs logs={logs} />
      </div>
    </div>
  );
}
