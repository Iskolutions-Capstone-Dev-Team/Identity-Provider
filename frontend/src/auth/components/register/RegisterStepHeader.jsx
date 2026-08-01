import { Mail } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

function maskEmail(email) {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  const visibleLocalPart = localPart.slice(0, Math.min(3, localPart.length));
  const hiddenLocalPart = "*".repeat(
    Math.max(localPart.length - visibleLocalPart.length, 2),
  );
  const [domainName, ...domainParts] = domainPart.split(".");
  const visibleDomainName = domainName.slice(0, Math.min(2, domainName.length));
  const hiddenDomainName = "*".repeat(
    Math.max(domainName.length - visibleDomainName.length, 2),
  );
  const domainSuffix = domainParts.length ? `.${domainParts.join(".")}` : "";

  return `${visibleLocalPart}${hiddenLocalPart}@${visibleDomainName}${hiddenDomainName}${domainSuffix}`;
}

export default function RegisterStepHeader({ step, email }) {
  const maskedEmail = email ? maskEmail(email) : "";

  if (step === "success") {
    return null;
  }

  return (
    <div className="space-y-3 text-center">
      <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)] transition duration-300 hover:scale-105"/>

      {step === "details" ? (
        <div className="space-y-2">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-white">
            Join <span className="text-[#f8d24e]">PUPTian!</span>
          </h2>
          <p className="text-sm text-muted-foreground text-white/80">
            Create an account to access PUPT systems.
          </p>
        </div>
      ) : null}

      {step === "verifyEmail" ? (
        <div className="space-y-2">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-white">
            Verify <span className="text-[#f8d24e]">Your Email</span>
          </h2>
          <p className="text-sm text-muted-foreground text-white/80">
            We sent a code to the email you provided ({maskedEmail}). If you
            can&apos;t find it, check your spam folder.
          </p>
        </div>
      ) : null}

      {step === "setPassword" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight text-white">
              Set Your <span className="text-[#f8d24e]">Password</span>
            </h2>
            <p className="text-sm text-muted-foreground text-white/80">
              Create your password to finish your registration.
            </p>
          </div>

          {maskedEmail ? (
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-2 bg-white/10 border-white/15 text-white/85 hover:bg-white/20 px-4 py-1.5 rounded-full font-semibold uppercase tracking-[0.08em] text-xs">
                <Mail className="size-3.5" strokeWidth={2} />
                {maskedEmail}
              </Badge>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}