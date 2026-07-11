import { useNavigate } from "react-router-dom";
import { Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar({ activeColorMode = "light", onToggleColorMode, showColorModeToggle = false }) {
  const navigate = useNavigate();
  const isDarkMode = activeColorMode === "dark";

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

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          aria-label="Open profile"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}