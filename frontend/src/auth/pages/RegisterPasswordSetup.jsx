import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPasswordSetupForm from "../components/RegisterPasswordSetupForm";
import { isInvitationForbiddenError, registrationActivationService } from "../services/registrationActivationService";
import { buildLoginPath, getLoginClientId } from "../utils/loginRoute";

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
  const [hasForcedInvalid, setHasForcedInvalid] = useState(false);

  const { isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['checkInvitation', invitationCode],
    queryFn: () => registrationActivationService.checkInvitation(invitationCode),
    enabled: !!invitationCode && !hasForcedInvalid,
    retry: false
  });

  const isForbidden = hasForcedInvalid || !invitationCode || (isError && isInvitationForbiddenError(error));
  const isChecking = isLoading && !isForbidden;
  const isGenericError = isError && !isForbidden;

  const validationState = isChecking
    ? VALIDATION_STATE.CHECKING
    : isForbidden
      ? VALIDATION_STATE.FORBIDDEN
      : isGenericError
        ? VALIDATION_STATE.ERROR
        : VALIDATION_STATE.READY;

  const validationError = isGenericError
    ? error?.response?.data?.error || error?.message || "Unable to validate the invitation link right now."
    : "";

  const handleInvalidInvitation = () => {
    setHasForcedInvalid(true);
  };

  return (
    <AuthLayout>
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
      <div className="rounded-[2rem] border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <div className="rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-6 text-center">
            <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="float-logo mx-auto block h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]" />

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