import { ShieldAlert } from "lucide-react";
import { EmailIcon, FacebookIcon } from "./authIcons";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../routes/routePaths";
import { IconTile } from "@/components/reui/icon-tile";
import { Separator } from "@/components/ui/separator";

export default function LoginFooter() {
  return (
    <footer className="w-full">
      <Separator className="bg-white/25 w-full max-w-[34rem] mx-auto lg:mx-0" />
      <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center justify-center gap-4 pt-4 sm:flex-row sm:gap-4 lg:mx-0 lg:justify-start">
        {/* Top group on mobile / Left group on desktop */}
        <div className="flex flex-row items-center gap-4">
          <aside className="flex items-center gap-4 text-left">
            <div className="flex shrink-0 items-center justify-center text-white">
              <IconTile aria-hidden="true" className="bg-transparent border-white/25 text-white">
                <ShieldAlert className="size-5" strokeWidth={1.5} />
              </IconTile>
            </div>
            <div className="space-y-1.5 text-[10px] font-medium tracking-[0.12em] text-white/70 sm:text-xs whitespace-nowrap">
              <Link to={ROUTE_PATHS.PRIVACY_POLICY} className="block transition duration-300 hover:text-[#f8d24e]">
                Privacy Policy
              </Link>
              <a href="https://www.pup.edu.ph/terms/" className="block transition duration-300 hover:text-[#f8d24e]">
                Terms of Service
              </a>
            </div>
          </aside>

          {/* Separator between Shield/Privacy and FB/Mail */}
          <Separator orientation="vertical" className="w-0 bg-transparent border-l border-white/25 h-10 shrink-0" />

          {/* FB & Mail */}
          <div className="flex items-center gap-3">
            <IconTile
              render={<a href="https://www.facebook.com/profile.php?id=61590127270893" target="_blank" rel="noopener noreferrer" aria-label="Visit Facebook profile" />}
              className="bg-transparent border-white/25 text-white hover:border-[#f8d24e]/50 hover:bg-white/15 hover:text-[#ffd700] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <FacebookIcon aria-hidden="true" />
            </IconTile>
            <IconTile
              render={<a href="mailto:iskolutions.team@gmail.com" aria-label="Email iskolutions.team@gmail.com" />}
              className="bg-transparent border-white/25 text-white hover:border-[#f8d24e]/50 hover:bg-white/15 hover:text-[#ffd700] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <EmailIcon className="size-5" aria-hidden="true" />
            </IconTile>
          </div>
        </div>

        {/* Separator between Left group and Right group (visible only on desktop) */}
        <Separator orientation="vertical" className="hidden sm:block w-0 bg-transparent border-l border-white/25 h-10 shrink-0" />

        {/* Bottom group on mobile / Right group on desktop */}
        <div className="flex items-center gap-3 text-left mt-2 sm:mt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
            <img src="/assets/images/Nexus_Logo.png" alt="Nexus Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide whitespace-nowrap">PUPT Digital Nexus</span>
            <span className="text-[10px] sm:text-xs text-white/60">Capstone Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
}