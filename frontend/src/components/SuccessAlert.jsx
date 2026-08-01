import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription, AlertAction } from "@/components/reui/alert";

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
        }, 150);
      }, 4000);
    } else {
      setIsVisible(false);
      removeTimeout = window.setTimeout(() => {
        setShouldRender(false);
      }, 150);
    }

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, [message, onClose]);

  if (!shouldRender) return null;

  const animationClass = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 -translate-y-2";

  const alert = (
    <div className={`pointer-events-none fixed right-3 top-4 z-[180] flex w-[calc(100%-1.5rem)] max-w-[24rem] justify-end sm:right-5 sm:top-5 sm:w-[24rem] lg:right-6 lg:top-6 xl:right-8 transition-all duration-150 ease-out ${animationClass}`}>
      <div className="pointer-events-auto w-full">
        <Alert variant="success" className="bg-emerald-50 border-emerald-200 text-emerald-900 shadow-lg [&>svg]:text-emerald-600">
          <CircleCheckIcon />
          <AlertDescription className="text-emerald-800">{message}</AlertDescription>
          {onClose && (
            <AlertAction>
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 150);
                }}
                aria-label="Close alert"
                className="flex items-center justify-center rounded-md p-1 text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </AlertAction>
          )}
        </Alert>
      </div>
    </div>
  );

  return createPortal(alert, document.body);
}