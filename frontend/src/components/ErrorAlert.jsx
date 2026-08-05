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
        <CircleAlertIcon />
        <AlertDescription className="text-red-800">{message}</AlertDescription>
        {onClose && (
          <AlertAction>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 150);
              }}
              aria-label="Close alert"
              className="flex items-center justify-center rounded-md p-1 text-red-600 hover:bg-red-100 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}