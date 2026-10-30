import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertAction } from "@/components/reui/alert";
import { CircleAlertIcon, XIcon } from "lucide-react";

export default function ErrorAlert({ message, onClose, autoHideDuration = 4000 }) {
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
      }, autoHideDuration);
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
  }, [message, autoHideDuration, onClose]);

  if (!shouldRender) return null;

  const animationClass = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 -translate-y-2";

  return (
    <div className={`transition-all duration-150 ease-out ${animationClass}`}>
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-600 shadow-sm">
        <CircleAlertIcon className="size-4 shrink-0" />
        <AlertDescription className="text-red-800 text-xs sm:text-sm font-medium leading-normal">{message}</AlertDescription>
        {onClose && (
          <AlertAction>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              aria-label="Close alert"
              className="flex size-6 items-center justify-center rounded-md text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors"
            >
              <XIcon className="size-3.5 sm:size-4 shrink-0" />
            </button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}