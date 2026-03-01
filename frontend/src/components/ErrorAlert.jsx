import { useEffect, useState } from "react";

export default function ErrorAlert({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let fadeTimeout;
    let autoCloseTimeout;

    if (message) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
      autoCloseTimeout = setTimeout(() => {
        setIsVisible(false);
        fadeTimeout = setTimeout(() => {
          onClose?.();
        }, 300);
      }, 4000);
    } else {
      setIsVisible(false);
      fadeTimeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
    return () => {
      clearTimeout(autoCloseTimeout);
      clearTimeout(fadeTimeout);
    };
  }, [message, onClose]);

  if (!shouldRender) return null;

  return (
    <div role="alert" className={`alert alert-error shadow-lg transition-all duration-300 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="btn btn-xs btn-ghost ml-auto">✕</button>
      )}
    </div>
  );
}