import { InfoCircleIcon } from "./mfaIcons";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function MfaSetupQrStep({ qrCodeUrl, isLoading, colorMode = "dark", onNext }) {
  const isDarkMode = colorMode === "dark";
  const titleClassName = "scroll-m-20 text-2xl font-semibold tracking-tight text-center";
  
  const alertClassName = isDarkMode
    ? "bg-blue-950/20 text-blue-100 border-blue-900/50"
    : "bg-blue-50 text-blue-900 border-blue-200";

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className={titleClassName}>Scan the QR code</h1>
      </div>

      <Alert className={alertClassName}>
        <Info className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Note: Scan this QR code using any authenticator app before clicking Next.
        </AlertDescription>
      </Alert>

      <div className="mx-auto flex min-h-[18rem] max-w-[18rem] items-center justify-center rounded-[1.5rem] border border-white/18 bg-white p-4 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.9)]">
        {isLoading ? (
          <div className="h-40 w-40 animate-pulse rounded-xl bg-slate-200" />
        ) : qrCodeUrl ? (
          <img src={qrCodeUrl} alt="Authenticator setup QR code" className="h-full w-full"/>
        ) : (
          <p className="text-sm text-slate-500">QR code unavailable</p>
        )}
      </div>
    </div>
  );
}