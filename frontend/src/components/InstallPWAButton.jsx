import { useState, useEffect } from "react";
import { Download, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { IconTile } from "@/components/reui/icon-tile";

export default function InstallPWAButton({ asSidebarItem = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  
  // Detect if the user is on an iOS device (Safari)
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  // Detect if the app is already installed and running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  useEffect(() => {
    // If on iOS and not already installed, it's considered "installable" via manual instructions
    if (isIos && !isStandalone) {
      setIsInstallable(true);
    }

    // Listen for the beforeinstallprompt event (Android/Windows)
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If the app is successfully installed, we can hide the button
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowIosInstructions(false);
      console.log("PWA was installed");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIos, isStandalone]);

  const handleInstallClick = async () => {
    // If it's an iOS device, show the instruction modal instead of triggering the prompt
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null; // Don't render the button if the app is already installed or not installable
  }

  const renderIosModal = () => (
    <Dialog open={showIosInstructions} onOpenChange={setShowIosInstructions}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Install on iOS</DialogTitle>
          <p className="text-sm font-normal opacity-90 mt-1 dark:text-muted-foreground">
            Install the app to your Home Screen for quick access.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4 pb-4">
          <div className="flex gap-3.5 items-start">
            <IconTile aria-hidden="true" className="mt-0.5 border-[#7b0d15]/15 bg-[#7b0d15]/10 text-[#7b0d15] dark:border-[#ffe28a]/25 dark:bg-[#ffe28a]/15 dark:text-[#ffe28a]">
              <Share className="w-5 h-5" />
            </IconTile>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-foreground">Step 1</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tap the <strong>Share</strong> button at the bottom of your Safari browser.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start mt-4">
            <IconTile aria-hidden="true" className="mt-0.5 border-[#7b0d15]/15 bg-[#7b0d15]/10 text-[#7b0d15] dark:border-[#ffe28a]/25 dark:bg-[#ffe28a]/15 dark:text-[#ffe28a]">
              <PlusSquare className="w-5 h-5" />
            </IconTile>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-foreground">Step 2</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 mt-4 border-t border-border pt-4 -mx-4 px-4 bg-muted/30 rounded-b-xl">
          <Button type="button" onClick={() => setShowIosInstructions(false)} className="rounded-[0.55rem] bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (asSidebarItem) {
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleInstallClick} className="flex items-center gap-3 cursor-pointer max-md:h-7 max-md:text-xs" tooltip="Install App">
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">Install App</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {renderIosModal()}
      </>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2" onClick={handleInstallClick}>
        <Download className="h-4 w-4" />
        Install App
      </Button>
      {renderIosModal()}
    </>
  );
}
