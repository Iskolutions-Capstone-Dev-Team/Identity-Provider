import { useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import RegisterPasswordSetupForm from "../components/RegisterPasswordSetupForm";
import { getLoginClientId } from "../utils/loginRoute";

const infoCards = [
  {
    title: "Verification-based activation",
    description:
      "This screen is reserved for the secure link sent after registration approval.",
    icon: <LinkIcon />,
  },
  {
    title: "Finish account setup",
    description:
      "Create a strong password here so the normal sign-in flow stays separate from registration review.",
    icon: <ShieldIcon />,
  },
];

export default function RegisterPasswordSetup() {
  const [searchParams] = useSearchParams();
  const clientId = getLoginClientId(searchParams);
  const email = searchParams.get("email") || "";

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
              Once a registration is approved, the user finishes the setup here
              through the email verification link.
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
          <RegisterPasswordSetupForm clientId={clientId} email={email} />
        </section>
      </div>
    </AuthLayout>
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