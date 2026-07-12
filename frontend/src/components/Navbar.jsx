import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function Navbar({ activeColorMode = "light", onToggleColorMode, showColorModeToggle = false, currentUser }) {
  const navigate = useNavigate();
  const isDarkMode = activeColorMode === "dark";

  const firstName = currentUser?.given_name || currentUser?.givenName || currentUser?.firstName || "";
  const lastName = currentUser?.family_name || currentUser?.familyName || currentUser?.lastName || currentUser?.surname || "";
  const firstWordOfFirstName = firstName.split(" ")[0];
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = currentUser?.email || "user@example.com";
  
  const initials = `${firstName ? firstName.charAt(0) : ""}${lastName ? lastName.charAt(0) : ""}`.toUpperCase() || "U";
  const avatarBgClass = isDarkMode ? "bg-white text-black" : "bg-[#7b0d15] text-[#f8d24e]";

  return (
    <nav className="relative z-20 flex w-full items-center justify-between gap-4 py-3 bg-background text-foreground transition-all duration-300">
      <div className="flex items-center min-w-0 flex-1">
        <SidebarTrigger className="-ml-2 mr-2" />
        <div id="navbar-breadcrumbs" className="min-h-[1.25rem] flex items-center"></div>
      </div>

      <div className="flex items-center gap-2">
        {showColorModeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleColorMode}
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? "Switch page to light mode" : "Switch page to dark mode"}
            title={isDarkMode ? "Switch page to light mode" : "Switch page to dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}

        <HoverCard>
          <HoverCardTrigger asChild>
            <div 
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate("/profile")}
            >
              <Avatar className="size-8">
                <AvatarFallback className={avatarBgClass}>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium hover:underline leading-none">
                  {firstWordOfFirstName} {lastName}
                </p>
                <p className="text-muted-foreground text-xs">{email}</p>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64" align="end">
            <div className="flex space-x-2">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className={avatarBgClass}>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div>
                  <p className="text-sm font-medium hover:underline leading-none mb-1">
                    {fullName}
                  </p>
                  <p className="text-muted-foreground text-xs">{email}</p>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </nav>
  );
}