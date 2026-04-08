import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SuccessAlert from "../components/SuccessAlert";
import NotificationsListCard from "../components/notification/NotificationsListCard";
import NotificationsSummaryCard from "../components/notification/NotificationsSummaryCard";
import { useUsers } from "../hooks/useUsers";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

export default function Notifications() {
  const { colorMode = "light" } = useOutletContext() || {};
  const {
    users,
    loading,
    fetchError,
    successMessage,
    setSuccessMessage,
    updateUser,
    deleteUser,
  } = useUsers();
  const [actionError, setActionError] = useState("");
  const showLoading = useDelayedLoading(loading);

  const registrants = useMemo(() => {
    return [...users]
      .filter((user) => user?.status === "inactive")
      .sort((firstUser, secondUser) => {
        const firstTimestamp = Date.parse(firstUser?.createdAt || "");
        const secondTimestamp = Date.parse(secondUser?.createdAt || "");

        if (Number.isNaN(firstTimestamp) && Number.isNaN(secondTimestamp)) {
          return 0;
        }

        if (Number.isNaN(firstTimestamp)) {
          return 1;
        }

        if (Number.isNaN(secondTimestamp)) {
          return -1;
        }

        return secondTimestamp - firstTimestamp;
      });
  }, [users]);

  const displayRegistrants = useMemo(() => {
    return registrants.map((registrant) => ({
      ...registrant,
      workflowStatus: "pending",
    }));
  }, [registrants]);

  const pendingRegistrantsCount = useMemo(() => {
    return displayRegistrants.filter(
      (registrant) => registrant.workflowStatus === "pending",
    ).length;
  }, [displayRegistrants]);

  const handleApproveRegistrant = async (user) => {
    setActionError("");

    try {
      await updateUser(
        {
          ...user,
          status: "active",
        },
        user,
      );
    } catch (error) {
      setActionError(error?.message || "Failed to approve the registrant.");
    }
  };

  const handleRejectRegistrant = async (user) => {
    setActionError("");

    await deleteUser(user?.id, user?.displayName || user?.email || "User");
  };

  return (
    <>
      <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
        <PageHeader
          title="Notifications"
          description="Track pending registrants in one view."
          colorMode={colorMode}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 sm:h-24 sm:w-24">
              <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd"/>
            </svg>
          }
          variant="hero"
        />

        <NotificationsSummaryCard
          registrantsCount={pendingRegistrantsCount}
          loading={showLoading}
          colorMode={colorMode}
        />

        <div className="relative">
          <NotificationsListCard
            loadingRegistrants={showLoading}
            registrants={displayRegistrants}
            fetchError={actionError || fetchError}
            onApproveRegistrant={handleApproveRegistrant}
            onRejectRegistrant={handleRejectRegistrant}
            colorMode={colorMode}
          />
        </div>
      </div>

      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}