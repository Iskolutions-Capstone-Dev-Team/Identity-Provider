import { EmailIcon } from "./registerIcons";

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
          <h2 className="text-[1.85rem] font-bold leading-none text-white">
            Join <span className="text-[#f8d24e]">PUPTian!</span>
          </h2>
          <p className="mx-auto max-w-sm text-base font-light leading-6 text-white/75">
            Create an account to access PUPT systems.
          </p>
        </div>
      ) : null}

      {step === "verifyEmail" ? (
        <div className="space-y-2">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Verify <span className="text-[#f8d24e]">Your Email</span>
          </h2>
          <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
            We sent a code to the email you provided ({maskedEmail}). If you
            can&apos;t find it, check your spam folder.
          </p>
        </div>
      ) : null}

      {step === "setPassword" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Set Your <span className="text-[#f8d24e]">Password</span>
            </h2>
            <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
              Create your password to finish your registration.
            </p>
          </div>

          {maskedEmail ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/85">
              <EmailIcon />
              {maskedEmail}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}