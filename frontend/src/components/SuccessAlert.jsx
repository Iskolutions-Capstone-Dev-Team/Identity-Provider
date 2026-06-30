import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, SuccessIcon } from "./componentIcons";

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

  const alert = (
    <div className="pointer-events-none fixed right-3 top-4 z-[180] flex w-[calc(100%-1.5rem)] max-w-[24rem] justify-end sm:right-5 sm:top-5 sm:w-[24rem] lg:right-6 lg:top-6 xl:right-8">
      <div className="pointer-events-auto w-full">
        <div role="alert" aria-live="polite" className={`relative overflow-hidden rounded-[1.4rem] border border-emerald-500/24 bg-[linear-gradient(135deg,rgba(8,64,49,0.95),rgba(10,32,29,0.98))] text-emerald-50 shadow-[0_26px_60px_-32px_rgba(5,150,105,0.52)] backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out ${motionClassName}`}>
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

  return createPortal(alert, document.body);
}