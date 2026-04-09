import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPasswordSetupForm from "../components/RegisterPasswordSetupForm";
import { isInvitationForbiddenError, registrationActivationService } from "../services/registrationActivationService";
import { buildLoginPath, getLoginClientId } from "../utils/loginRoute";

const infoCards = [
  {
    title: "Invitation-based activation",
    description:
      "This screen is used when a secure invitation link is opened from email.",
    icon: <LinkIcon />,
  },
  {
    title: "Finish account setup",
    description:
      "Create your password here so the invited account can move into the normal sign-in flow.",
    icon: <ShieldIcon />,
  },
];

const VALIDATION_STATE = Object.freeze({
  CHECKING: "checking",
  READY: "ready",
  FORBIDDEN: "forbidden",
  ERROR: "error",
});

function normalizeTextValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default function RegisterPasswordSetup() {
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const email = searchParams.get("email") || "";
  const invitationCode = normalizeTextValue(searchParams.get("invitation_code"));
  const loginPath = buildLoginPath(clientId);
  const [validationState, setValidationState] = useState(
    invitationCode
      ? VALIDATION_STATE.CHECKING
      : VALIDATION_STATE.FORBIDDEN,
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    if (!invitationCode) {
      setValidationState(VALIDATION_STATE.FORBIDDEN);
      return undefined;
    }

    const validateInvitation = async () => {
      try {
        setValidationState(VALIDATION_STATE.CHECKING);
        setValidationError("");
        await registrationActivationService.checkInvitation(invitationCode);

        if (!isCancelled) {
          setValidationState(VALIDATION_STATE.READY);
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (isInvitationForbiddenError(error)) {
          setValidationState(VALIDATION_STATE.FORBIDDEN);
          return;
        }

        setValidationState(VALIDATION_STATE.ERROR);
        setValidationError(
          error?.response?.data?.error ||
            error?.message ||
            "Unable to validate the invitation link right now.",
        );
      }
    };

    validateInvitation();

    return () => {
      isCancelled = true;
    };
  }, [invitationCode]);

  const handleInvalidInvitation = () => {
    setValidationState(VALIDATION_STATE.FORBIDDEN);
  };

  return (
    <AuthLayout>
      <div className="grid w-full items-center gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(26rem,34rem)] xl:gap-14">
        <section className="hidden xl:flex xl:flex-col xl:gap-8 xl:pr-8">
          <div className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-xl">
            Account Activation
          </div>

          <div className="max-w-xl space-y-4">
            <h1 className="text-5xl font-semibold leading-tight text-white 2xl:text-6xl">
              Set Your Password
            </h1>
            <p className="max-w-lg text-lg leading-8 text-white/70">
              Invited users finish account setup here through the secure link
              sent by email.
            </p>
          </div>

          <div className="grid max-w-2xl gap-4 lg:grid-cols-2">
            {infoCards.map((card) => (
              <article key={card.title} className="group rounded-[1.75rem] border border-white/20 bg-white/10 p-5 shadow-[0_24px_55px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#f8d24e]/40 hover:bg-white/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8d24e]/20 text-[#ffd700] transition duration-300 group-hover:scale-105 group-hover:bg-[#f8d24e]/25">
                  {card.icon}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex w-full justify-center xl:justify-end">
          {validationState === VALIDATION_STATE.READY ? (
            <RegisterPasswordSetupForm
              clientId={clientId}
              email={email}
              invitationCode={invitationCode}
              onInvalidInvitation={handleInvalidInvitation}
            />
          ) : (
            <InvitationGateCard
              state={validationState}
              errorMessage={validationError}
              loginPath={loginPath}
            />
          )}
        </section>
      </div>
    </AuthLayout>
  );
}

function InvitationGateCard({ state = VALIDATION_STATE.CHECKING, errorMessage = "", loginPath = "/login" }) {
  const isChecking = state === VALIDATION_STATE.CHECKING;
  const isForbidden = state === VALIDATION_STATE.FORBIDDEN;
  const title = isChecking
    ? "Checking Invitation"
    : isForbidden
      ? "403 Forbidden"
      : "Unable to Open Invitation";
  const description = isChecking
    ? "Please wait while we validate your invitation link."
    : isForbidden
      ? "This invitation link is invalid or expired."
      : errorMessage || "The invitation link could not be validated.";

  return (
    <div className="relative z-20 w-full max-w-[34rem] px-1 sm:px-0">
      <div className="rounded-4xl border border-white/20 bg-white/10 p-1 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-4px)] bg-[linear-gradient(180deg,rgba(120,12,22,0.72),rgba(60,7,12,0.86))] px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-[#f8d24e] shadow-[0_20px_45px_-28px_rgba(248,210,78,0.55)]">
              {isChecking ? <LoaderIcon /> : <LockIcon />}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold leading-tight text-white">
                {title}
              </h2>
              <p className="mx-auto max-w-sm text-sm font-light leading-6 text-white/80">
                {description}
              </p>
            </div>

            {!isChecking && (
              <Link to={loginPath} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold tracking-[0.04em] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white">
                Back to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.19 8.688a4.5 4.5 0 0 1 6.364 6.364l-3 3a4.5 4.5 0 0 1-6.364 0m3-12.728a4.5 4.5 0 0 0-6.364 0l-3 3a4.5 4.5 0 0 0 0 6.364m4.243-1.414 7.072-7.072"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3.75 5.25 6.75v5.063c0 3.902 2.527 7.356 6.25 8.438 3.723-1.082 6.25-4.536 6.25-8.438V6.75L12 3.75Zm-1.25 8.75 1.5 1.5 3-3"/>
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" className="stroke-white/25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
  );
}