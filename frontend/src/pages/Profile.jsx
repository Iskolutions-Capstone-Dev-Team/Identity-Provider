import { useState } from "react";
import { useOutletContext } from "react-router-dom";
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
  const updateCurrentUser = outletContext?.updateCurrentUser;
  const colorMode = outletContext?.colorMode || "light";
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);

  const handleAddAuditLog = (log) => {
    setLogs((currentLogs) => [log, ...currentLogs]);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      <div className="grid gap-6">
        <ProfileCard
          profile={profile}
          updateCurrentUser={updateCurrentUser}
          addAuditLog={handleAddAuditLog}
          allowEmailEdit={false}
          colorMode={colorMode}
        />
        <ProfileAuditLogs logs={logs} colorMode={colorMode} />
      </div>
    </div>
  );
}