import { useEffect, useEffectEvent, useState } from "react";

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function ErrorAlert({ message, onClose, autoHideDuration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const handleClose = useEffectEvent(() => {
    onClose?.();
  });

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
          handleClose();
        }, 280);
      }, autoHideDuration);
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
  }, [message, autoHideDuration]);

  if (!shouldRender) {
    return null;
  }

  const motionClassName = isVisible
    ? "translate-y-0 scale-100 opacity-100"
    : "-translate-y-2 scale-[0.98] opacity-0";

  return (
    <div role="alert" aria-live="polite" className={`relative w-full overflow-hidden rounded-[1.4rem] border border-[#f8d24e]/20 bg-[linear-gradient(135deg,rgba(112,20,31,0.96),rgba(45,9,16,0.99))] text-white shadow-[0_26px_60px_-32px_rgba(123,13,21,0.56)] backdrop-blur-xl transition-all duration-300 ease-out ${motionClassName}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,210,78,0.16),transparent_26%),radial-gradient(circle_at_right,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(123,13,21,0.18),transparent_34%)]" />

      <div className="relative flex items-center gap-3 px-4 py-4">
        <div className="shrink-0 text-[#f8d24e]">
          <ErrorIcon />
        </div>

        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-6 text-white/88">
          {message}
        </p>

        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close alert" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors duration-200 hover:bg-white/8 hover:text-[#f8d24e]">
            <CloseIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}