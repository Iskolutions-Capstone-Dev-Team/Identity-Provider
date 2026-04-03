import { Link } from "react-router-dom";

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

export default function RegistrationSuccessStep({ email, loginPath }) {
  const maskedEmail = email ? maskEmail(email) : "your email address";

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#f8d24e]/35 bg-[linear-gradient(180deg,rgba(255,248,243,0.98),rgba(255,255,255,0.95))] px-6 py-8 text-center text-[#351018] shadow-[0_32px_80px_-42px_rgba(91,11,18,0.35)]">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_20px_45px_-28px_rgba(16,185,129,0.6)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>

          <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#f8d24e] text-[#7b0d15] shadow-[0_10px_20px_-14px_rgba(248,210,78,0.9)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </span>
        </div>

        <h3 className="mt-6 text-3xl font-bold leading-tight">
          Registration Successful!
        </h3>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#f8d24e]/50 bg-[#fff4dc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b0d15]">
          <ClockIcon />
          Pending Verification
        </div>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#6f4f56]">
          Thank you for registering. Your request has been received
          successfully.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-[#f8d24e]/30 bg-[linear-gradient(180deg,rgba(255,247,236,0.97),rgba(255,251,246,0.94))] p-5 shadow-[0_22px_45px_-36px_rgba(91,11,18,0.26)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[#7b0d15]">
            <EmailIcon />
          </span>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#7b0d15]">
              What happens next?
            </p>
            <p className="text-sm leading-6 text-[#6f4f56]">
              Our admin team will review your registration. We&apos;ll send a
              password setup link to{" "}
              <span className="font-semibold text-[#5a0b12]">{maskedEmail}</span>{" "}
              once your account has been verified.
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-sm text-white/78">
        This usually takes 1-2 business days.
      </p>

      <div className="space-y-3">
        <Link to={loginPath} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
          Back to Login
        </Link>
      </div>

      <p className="text-center text-sm text-white/68">
        Need help? Contact us at{" "}
        <a href="mailto:iskolutions.team@gmail.com" className="font-medium text-[#f8d24e] underline decoration-transparent transition duration-300 hover:decoration-[#f8d24e]">
          iskolutions.team@gmail.com
        </a>
        .
      </p>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}