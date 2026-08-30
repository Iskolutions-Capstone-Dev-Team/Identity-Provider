import { useOutletContext } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import AuthenticatorsPanel from "../components/AuthenticatorsPanel";
import RememberedDevicesPanel from "../components/RememberedDevicesPanel";
import { EMPTY_CURRENT_USER } from "../../../hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Monitor } from "lucide-react";

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
      <div className="grid gap-6 min-w-0">
        <ProfileCard
          profile={profile}
          updateCurrentUser={updateCurrentUser}
          allowEmailEdit={false}
          colorMode={colorMode}
        />
        <div className="flex w-full min-w-0 flex-col gap-6 mt-4">
          <Tabs defaultValue="authenticators">
            <TabsList variant="line" className="mb-3.5 justify-start flex-nowrap max-w-full overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="authenticators" className="gap-2 whitespace-nowrap">
                <Smartphone className="size-4 shrink-0" />
                Authenticators
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2 whitespace-nowrap">
                <Monitor className="size-4 shrink-0" />
                Remembered Devices
              </TabsTrigger>
            </TabsList>
            <div className="w-full min-w-0">
              <TabsContent value="authenticators" className="mt-0 outline-none">
                <AuthenticatorsPanel
                  email={profile.email}
                  colorMode={colorMode}
                />
              </TabsContent>
              <TabsContent value="devices" className="mt-0 outline-none">
                <RememberedDevicesPanel
                  colorMode={colorMode}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}