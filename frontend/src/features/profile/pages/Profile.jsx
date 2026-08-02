import { useOutletContext } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import AuthenticatorsPanel from "../components/AuthenticatorsPanel";
import { EMPTY_CURRENT_USER } from "../../../hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function Profile() {
  const outletContext = useOutletContext();
  const profile = outletContext?.currentUser || EMPTY_CURRENT_USER;
  const updateCurrentUser = outletContext?.updateCurrentUser;
  const colorMode = outletContext?.colorMode || "light";
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 py-8 sm:px-0 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem]">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}
      <div className="grid gap-6">
        <ProfileCard
          profile={profile}
          updateCurrentUser={updateCurrentUser}
          allowEmailEdit={false}
          colorMode={colorMode}
        />
        <AuthenticatorsPanel
          email={profile.email}
          colorMode={colorMode}
        />
      </div>
    </div>
  );
}