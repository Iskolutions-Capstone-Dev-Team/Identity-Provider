import { useState } from "react";
import OnePortalLayout from "../layouts/IdpLayout";
import ProfileCard from "../components/profile/ProfileCard";
import AuditLogs from "../components/profile/AuditLogs";

export default function Profile() {
    const [logs, setLogs] = useState([
        { timestamp: "2024-01-20 14:25:10", action: "PROFILE_UPDATE", details: "Updated email address", color: "blue" },
        { timestamp: "2024-01-18 09:15:22", action: "LOGIN_SUCCESS", details: "Successful login", color: "green" },
        { timestamp: "2024-01-15 16:45:33", action: "PASSWORD_CHANGE", details: "Password changed", color: "yellow" },
        { timestamp: "2024-01-10 11:20:45", action: "ROLE_ASSIGNED", details: "Assigned student role", color: "purple" },
        { timestamp: "2023-08-15 10:30:45", action: "ACCOUNT_CREATED", details: "Account created", color: "gray" },
    ]);

    const handleAddAuditLog = (log) => {
        setLogs(prev => [log, ...prev]);
    };

    return (
        <OnePortalLayout>
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">User Profile Information</h1>
                        <p className="text-gray-600 mt-2">View and manage your account details</p>    
                    </div>    
                    <ProfileCard 
                        profile={{
                            firstName: "Juan",
                            middleName: "Miguel",
                            lastName: "Dela Cruz",
                            username: "juan.delacruz",
                            email: "juan.delacruz@iskolarngbayan.pup.edu.ph",
                        }}
                        addAuditLog={handleAddAuditLog} 
                        allowEmailEdit={false}
                    />
                    <AuditLogs logs={logs} />
                </div> 
            </div>
        </OnePortalLayout>
    );
}