import { useOutletContext } from "react-router-dom";
import ProfileCard from "../components/profile/ProfileCard";
import AuthenticatorsPanel from "../components/profile/AuthenticatorsPanel";
import { EMPTY_CURRENT_USER } from "../hooks/useCurrentUser";

export default function Profile() {
  const outletContext = useOutletContext();
  const profile = outletContext?.currentUser || EMPTY_CURRENT_USER;
  const updateCurrentUser = outletContext?.updateCurrentUser;
  const colorMode = outletContext?.colorMode || "light";

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
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