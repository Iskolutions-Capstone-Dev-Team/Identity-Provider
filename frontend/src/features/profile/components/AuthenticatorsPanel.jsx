import { useCallback, useEffect, useState } from "react";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import ErrorAlert from "../../../components/ErrorAlert";
import SuccessAlert from "../../../components/SuccessAlert";
import NewAuthenticatorModal from "./NewAuthenticatorModal";
import { mfaService } from "../../../services/mfaService";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { PhoneIcon, PasskeyIcon, AddedIcon, LastUsedIcon, DeleteIcon } from "./profileIcons";

const AUTHENTICATORS_PER_SLIDE = 3;

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const timestamp = formatTimestamp(value);

  return timestamp === "NaN-NaN-NaN NaN:NaN:NaN" ? "Unavailable" : timestamp;
}

function getAuthenticatorTypeLabel(type) {
  const normalizedType = String(type || "").toLowerCase();

  if (normalizedType === "totp") {
    return "authenticator app";
  }

  return normalizedType || "authenticator app";
}

function AuthenticatorIcon({ colorMode, type }) {
  const isDarkMode = colorMode === "dark";
  const isPasskey = String(type || "").toLowerCase() === "passkey";

  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] sm:h-16 sm:w-16 ${
        isDarkMode
          ? "border border-[#f8d24e]/35 bg-[#f8d24e]/10 text-[#ffe28a] shadow-[0_18px_44px_-34px_rgba(248,210,78,0.8)]"
          : "border border-[#f8d24e]/45 bg-[#fff4dc] text-[#7b0d15] shadow-[0_18px_44px_-34px_rgba(123,13,21,0.45)]"
      }`}
    >
      {isPasskey ? <PasskeyIcon /> : <PhoneIcon />}
    </div>
  );
}

export default function AuthenticatorsPanel({ email = "", colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const [authenticators, setAuthenticators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [authenticatorToDelete, setAuthenticatorToDelete] = useState(null);
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const loadAuthenticators = useCallback(async () => {
    if (!email) {
      setAuthenticators([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const list = await mfaService.getAuthenticators(email);
      setAuthenticators(list);
    } catch (loadError) {
      setError(
        getRequestErrorMessage(
          loadError,
          "Unable to load authenticator apps.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadAuthenticators();
  }, [loadAuthenticators]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [authenticators.length]);

  const handleDeleteAuthenticator = async () => {
    if (!authenticatorToDelete?.id) {
      return;
    }

    try {
      await mfaService.deleteAuthenticator({
        email,
        id: authenticatorToDelete.id,
      });
      setAuthenticatorToDelete(null);
      setSuccessMessage("Authenticator removed successfully.");
      await loadAuthenticators();
    } catch (deleteError) {
      setError(
        getRequestErrorMessage(
          deleteError,
          "Unable to remove this authenticator.",
        ),
      );
    }
  };

  const wrapperClassName = isDarkMode
    ? "relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(33,21,30,0.92))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] sm:p-6"
    : "relative overflow-hidden rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] sm:p-6";
  const headingClassName = isDarkMode
    ? "text-xl font-semibold text-[#f4eaea]"
    : "text-xl font-semibold text-[#351018]";
  const bodyTextClassName = isDarkMode
    ? "text-sm text-[#c7adb4]"
    : "text-sm text-[#7b5560]";
  const emptyClassName = isDarkMode
    ? "rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,248,243,0.025))] px-4 py-5 text-center text-sm text-[#c7adb4]"
    : "rounded-2xl border border-[#7b0d15]/10 bg-[#fffaf2] px-4 py-5 text-center text-sm text-[#7b5560]";
  const newConnectionButtonClassName = isDarkMode
    ? "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(2,6,23,0.75)] transition-[background-color,background-image,border-color,color,box-shadow] duration-500 ease-out hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]";
  const cardClassName = isDarkMode
    ? "relative min-h-[13.5rem] overflow-hidden rounded-[1.25rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,248,243,0.025))] p-4 shadow-[0_18px_42px_-34px_rgba(2,6,23,0.85)] sm:max-w-[18rem]"
    : "relative min-h-[13.5rem] overflow-hidden rounded-[1.25rem] border border-[#7b0d15]/12 bg-white/78 p-4 shadow-[0_18px_42px_-34px_rgba(43,3,7,0.55)] sm:max-w-[18rem]";
  const cardTitleClassName = isDarkMode
    ? "break-words text-base font-bold text-[#f4eaea]"
    : "break-words text-base font-bold text-[#351018]";
  const cardTypeClassName = isDarkMode
    ? "mt-1 text-sm font-semibold text-[#c7adb4]"
    : "mt-1 text-sm font-semibold text-[#7b5560]";
  const metadataClassName = isDarkMode
    ? "space-y-2 border-t border-white/10 pt-3 text-xs font-semibold text-[#c7adb4]"
    : "space-y-2 border-t border-[#7b0d15]/10 pt-3 text-xs font-semibold text-[#7b5560]";
  const metadataIconClassName = isDarkMode ? "text-[#ffd700]" : "text-[#7b0d15]";
  const deleteButtonClassName =
    "btn absolute right-4 top-4 h-10 w-10 rounded-[0.9rem] border border-red-400/45 bg-red-500/10 p-0 text-red-500 shadow-none transition hover:border-red-500/70 hover:bg-red-500/15 hover:text-red-400";
  const carouselButtonClassName = isDarkMode
    ? "btn btn-circle h-11 min-h-11 w-11 border border-[#f8d24e]/35 bg-[#f8d24e]/10 text-[#ffe28a] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#f8d24e]/20"
    : "btn btn-circle h-11 min-h-11 w-11 border border-[#7b0d15]/20 bg-white text-[#7b0d15] shadow-none transition hover:border-[#f8d24e] hover:bg-[#fff4dc]";
  const pageDotClassName = isDarkMode
    ? "h-2 w-2 rounded-full bg-white/18 transition-[width,background-color] duration-300 hover:bg-white/35"
    : "h-2 w-2 rounded-full bg-[#d8cfd0] transition-[width,background-color] duration-300 hover:bg-[#c7adb4]";
  const activePageDotClassName =
    "h-2 w-5 rounded-full bg-[#7b0d15] transition-[width,background-color] duration-300";
  const slideCount = Math.ceil(authenticators.length / AUTHENTICATORS_PER_SLIDE);
  const hasCarouselControls = slideCount > 1;
  const carouselSlides = Array.from({ length: slideCount }, (_, slideIndex) =>
    authenticators.slice(
      slideIndex * AUTHENTICATORS_PER_SLIDE,
      slideIndex * AUTHENTICATORS_PER_SLIDE + AUTHENTICATORS_PER_SLIDE,
    ),
  );

  const goToPreviousSlide = () => {
    setCurrentSlide((slide) => (slide === 0 ? slideCount - 1 : slide - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((slide) => (slide + 1) % slideCount);
  };

  const renderAuthenticatorCard = (authenticator) => (
    <article key={authenticator.id} className={cardClassName}>
      <div className="flex min-w-0 flex-col gap-4">
        <AuthenticatorIcon colorMode={colorMode} type={authenticator.type} />

        <div className="min-w-0 pr-10">
          <h4 className={cardTitleClassName}>
            {authenticator.name || "Authenticator app"}
          </h4>
          <p className={cardTypeClassName}>
            Type: {getAuthenticatorTypeLabel(authenticator.type)}
          </p>
        </div>

        <div className={metadataClassName}>
          <p className="flex items-center gap-2">
            <span className={metadataIconClassName}><AddedIcon /></span>
            <span>Added: {formatDate(authenticator.created_at)}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className={metadataIconClassName}><LastUsedIcon /></span>
            <span>Last used: {formatDate(authenticator.last_used_at)}</span>
          </p>
        </div>
      </div>

      <button type="button" onClick={() => setAuthenticatorToDelete(authenticator)} aria-label={`Delete ${authenticator.name || "authenticator app"}`} title="Delete authenticator" className={deleteButtonClassName}>
        <DeleteIcon />
      </button>
    </article>
  );

  return (
    <>
      <section className={wrapperClassName}>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className={headingClassName}>Authenticator Apps</h3>
              <p className={`mt-1 ${bodyTextClassName}`}>
                Manage the authenticator apps connected to your account.
              </p>
            </div>

            <button type="button" className={newConnectionButtonClassName} onClick={() => setIsNewConnectionOpen(true)}>
              + New Connection
            </button>
          </div>

          <ErrorAlert message={error} onClose={() => setError("")} />

          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1].map((item) => (
                <div key={item}
                  className={`h-24 animate-pulse rounded-2xl ${
                    isDarkMode
                      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,248,243,0.025))]"
                      : "bg-slate-200/40"
                  }`}
                />
              ))}
            </div>
          ) : authenticators.length === 0 ? (
            <div className={emptyClassName}>
              No authenticator apps are connected yet.
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
                {authenticators.map(renderAuthenticatorCard)}
              </div>

              <div className="carousel hidden w-full overflow-hidden lg:block">
                <div className="flex w-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {carouselSlides.map((slideAuthenticators, slideIndex) => (
                    <div key={slideIndex} className="carousel-item w-full shrink-0">
                      <div className="grid w-full justify-center gap-3 sm:grid-cols-[repeat(3,minmax(15rem,18rem))]">
                        {slideAuthenticators.map(renderAuthenticatorCard)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hasCarouselControls ? (
                <div className="mt-4 hidden items-center justify-center gap-3 lg:absolute lg:-left-3 lg:-right-3 lg:top-1/2 lg:mt-0 lg:flex lg:-translate-y-1/2 lg:justify-between">
                  <button type="button" className={carouselButtonClassName} onClick={goToPreviousSlide} aria-label="Show previous authenticators">
                    &#10094;
                  </button>
                  <button type="button" className={carouselButtonClassName} onClick={goToNextSlide} aria-label="Show next authenticators">
                    &#10095;
                  </button>
                </div>
              ) : null}

              {hasCarouselControls ? (
                <div className="mt-4 hidden items-center justify-center gap-2 lg:flex" aria-label="Authenticator carousel pages">
                  {carouselSlides.map((_, slideIndex) => (
                    <button key={slideIndex} type="button" className={slideIndex === currentSlide ? activePageDotClassName : pageDotClassName} onClick={() => setCurrentSlide(slideIndex)} aria-label={`Show authenticator page ${slideIndex + 1}`} aria-current={slideIndex === currentSlide ? "page" : undefined}/>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmModal
        open={Boolean(authenticatorToDelete)}
        message={`Delete ${authenticatorToDelete?.name || "this authenticator"}?`}
        onCancel={() => setAuthenticatorToDelete(null)}
        onConfirm={handleDeleteAuthenticator}
        theme="glass"
        colorMode={colorMode}
      />
      <NewAuthenticatorModal
        open={isNewConnectionOpen}
        email={email}
        colorMode={colorMode}
        onClose={() => setIsNewConnectionOpen(false)}
        onCreated={async ({ type } = {}) => {
          setSuccessMessage(
            type === "passkey"
              ? "Passkey connected successfully."
              : "Authenticator connected successfully.",
          );
          await loadAuthenticators();
        }}
      />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </>
  );
}
