import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/LoginForm";
import AccessDenied from "./AccessDenied";
import { buildLoginPath, getLoginClientId, getLoginErrorCode, getLoginErrorMessage, LOGIN_ERROR_CODES } from "../utils/loginRoute";
import { DEFAULT_AUTHENTICATED_PATH } from "../utils/authAccess";
import { hasStoredAccessToken } from "../utils/authRecovery";

const infoCards = [
  {
    title: "One sign-in for campus platforms",
    description: "Move between supported PUPT services with a single account.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.5 6H7.75A2.75 2.75 0 0 0 5 8.75v7.5A2.75 2.75 0 0 0 7.75 19h8.5A2.75 2.75 0 0 0 19 16.25V13.5M14 5h5m0 0v5m0-5-8 8"/>
      </svg>
    ),
  },
  {
    title: "Protected, centralized access",
    description: "Authentication stays consistent, secure, and easier to manage.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3.75 5.25 6.75v5.063c0 3.902 2.527 7.356 6.25 8.438 3.723-1.082 6.25-4.536 6.25-8.438V6.75L12 3.75Zm0 4.5a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-4.5 0v-.75A2.25 2.25 0 0 1 12 8.25Z"/>
      </svg>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const loginErrorCode = getLoginErrorCode(searchParams);
  const isAccessDeniedError = loginErrorCode === LOGIN_ERROR_CODES.UNAUTHORIZED;
  const loginErrorMessage = isAccessDeniedError
    ? ""
    : getLoginErrorMessage(searchParams);
  const [isResolvingAccess, setIsResolvingAccess] = useState(
    Boolean(clientId) && !loginErrorCode,
  );

  useEffect(() => {
    if (!clientId || loginErrorCode) {
      setIsResolvingAccess(false);
      return;
    }

    if (hasStoredAccessToken()) {
      navigate(DEFAULT_AUTHENTICATED_PATH, { replace: true });
      return;
    }

    setIsResolvingAccess(false);
  }, [clientId, loginErrorCode, navigate]);

  if (isAccessDeniedError) {
    return <AccessDenied />;
  }

  if (!searchParams.get("client_id") && clientId) {
    return (
      <Navigate
        to={buildLoginPath(clientId, { authError: loginErrorCode })}
        replace
      />
    );
  }

  if (isResolvingAccess) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/90 via-[#7b0d15]/80 to-[#180204]/90" />
          <div className="absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f8d24e]/20 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
          <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="w-28 sm:w-32 float-logo"/>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/75 sm:text-sm">
            Preparing Sign-In...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="grid w-full items-center gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(24rem,28rem)] xl:gap-14">
        <section className="hidden xl:flex xl:flex-col xl:gap-8 xl:pr-8">
          <div className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-xl">
            Unified Access
          </div>

          <div className="max-w-xl space-y-4">
            <h1 className="text-5xl font-semibold leading-tight text-white 2xl:text-6xl">
              Identity Provider
            </h1>
            <p className="max-w-lg text-lg leading-8 text-white/70">
              A cleaner way to enter connected PUPT systems through one secure sign-in.
            </p>
          </div>

          <div className="grid max-w-2xl gap-4 lg:grid-cols-2">
            {infoCards.map((card) => (
              <article key={card.title} className="group rounded-[1.75rem] border border-white/20 bg-white/10 p-5 shadow-[0_24px_55px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#f8d24e]/40 hover:bg-white/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8d24e]/20 text-[#ffd700] transition duration-300 group-hover:scale-105 group-hover:bg-[#f8d24e]/25">
                  {card.icon}
                </div>
                <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex w-full justify-center xl:justify-end">
          <LoginForm clientId={clientId} initialError={loginErrorMessage} />
        </section>
      </div>
    </AuthLayout>
  );
}