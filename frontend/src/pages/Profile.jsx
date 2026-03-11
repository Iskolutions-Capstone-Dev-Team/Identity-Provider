import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ProfileCard from "../components/profile/ProfileCard";
import ProfileAuditLogs from "../components/profile/AuditLogs";

const INITIAL_PROFILE = {
  firstName: "Juan",
  middleName: "Miguel",
  lastName: "Dela Cruz",
  email: "juan.delacruz@iskolarngbayan.pup.edu.ph",
};

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-28 h-28 text-[#991b1b]"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z"
              clipRule="evenodd"
            />
          </svg>
        }
      />

      <div className="w-full max-w-[85vw] sm:max-w-xl lg:max-w-7xl space-y-6">
        <ProfileCard
          profile={INITIAL_PROFILE}
          addAuditLog={handleAddAuditLog}
          allowEmailEdit={false}
        />
        <ProfileAuditLogs logs={logs} />
      </div>
    </div>
  );
}
