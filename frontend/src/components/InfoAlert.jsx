import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertAction } from "@/components/reui/alert";
import { InfoIcon, XIcon } from "lucide-react";

export default function InfoAlert({ message, onClose, autoHideDuration = 4000 }) {
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
      <Alert className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600 shadow-sm">
        <InfoIcon />
        <AlertDescription className="text-blue-800">{message}</AlertDescription>
        {onClose && (
          <AlertAction>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 150);
              }}
              aria-label="Close alert"
              className="flex items-center justify-center rounded-md p-1 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}
