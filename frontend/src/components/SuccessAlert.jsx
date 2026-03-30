import { useEffect, useState } from "react";

function SuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M6 18 18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function SuccessAlert({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let showTimeout;
    let hideTimeout;
    let removeTimeout;

    if (message) {
      setShouldRender(true);
      showTimeout = window.setTimeout(() => {
        setIsVisible(true);
      }, 10);

      hideTimeout = window.setTimeout(() => {
        setIsVisible(false);
        removeTimeout = window.setTimeout(() => {
          onClose?.();
        }, 280);
      }, 4000);
    } else {
      setIsVisible(false);
      removeTimeout = window.setTimeout(() => {
        setShouldRender(false);
      }, 280);
    }

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, [message, onClose]);

  if (!shouldRender) {
    return null;
  }

  const motionClassName = isVisible
    ? "translate-y-0 scale-100 opacity-100"
    : "-translate-y-2 scale-[0.98] opacity-0";

  return (
    <div className="pointer-events-none fixed inset-x-4 top-24 z-[120] flex justify-center sm:top-28 md:inset-x-auto md:right-4 md:top-32 md:w-[24rem] md:justify-start lg:bottom-5 lg:left-[var(--idp-success-alert-left)] lg:right-auto lg:top-auto lg:w-auto">
      <div className="pointer-events-auto w-full max-w-sm lg:w-[24rem]">
        <div role="alert" aria-live="polite" className={`relative overflow-hidden rounded-[1.4rem] border border-emerald-500/24 bg-[linear-gradient(135deg,rgba(8,64,49,0.95),rgba(10,32,29,0.98))] text-emerald-50 shadow-[0_26px_60px_-32px_rgba(5,150,105,0.52)] backdrop-blur-xl transition-all duration-300 ease-out ${motionClassName}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_right,rgba(16,185,129,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(248,210,78,0.12),transparent_36%)]" />

          <div className="relative flex items-center gap-3 px-4 py-4">
            <div className="shrink-0 text-emerald-200">
              <SuccessIcon />
            </div>

            <p className="min-w-0 flex-1 break-words text-sm font-medium leading-6 text-emerald-50/90">
              {message}
            </p>

            {onClose ? (
              <button type="button" onClick={onClose} aria-label="Close alert" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-50/70 transition-colors duration-200 hover:bg-white/8 hover:text-white">
                <CloseIcon />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}