import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle, AlertAction } from "@/components/reui/alert";
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
  }, [message, autoHideDuration, onClose]);

  if (!shouldRender) {
    return null;
  }

  const motionClassName = isVisible
    ? "translate-y-0 scale-100 opacity-100"
    : "-translate-y-2 scale-[0.98] opacity-0";

  return (
    <div className={`transition-all duration-300 ease-out ${motionClassName}`}>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Error! Something went wrong</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onClose && (
          <AlertAction>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 280);
              }}
              aria-label="Close alert"
              className="flex items-center justify-center rounded-md p-1 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}