import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

const TurnstileWidget = forwardRef(function TurnstileWidget(
  {
    siteKey,
    onSuccess,
    onError,
    onExpire,
    theme = "auto",
    size = "normal",
    className = "",
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Store latest callbacks in a mutable ref to prevent tearing down the widget
  // on parent state updates or re-renders (e.g. typing, clearing errors)
  const callbacksRef = useRef({ onSuccess, onError, onExpire });
  callbacksRef.current = { onSuccess, onError, onExpire };

  // Cloudflare test sitekey as default fallback if not configured
  const effectiveSiteKey =
    siteKey ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    import.meta.env.VITE_CF_TURNSTILE_SITE_KEY ||
    "1x00000000000000000000AA";

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetIdRef.current !== null && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (err) {
            console.error("[Turnstile] Reset error:", err);
          }
        }
      },
    }),
    []
  );

  useEffect(() => {
    let isCancelled = false;

    const renderWidget = () => {
      if (
        !containerRef.current ||
        !window.turnstile ||
        widgetIdRef.current !== null ||
        isCancelled
      ) {
        return;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          callback: (token) => {
            callbacksRef.current.onSuccess?.(token);
          },
          "error-callback": (err) => {
            callbacksRef.current.onError?.(err);
          },
          "expired-callback": () => {
            callbacksRef.current.onExpire?.();
          },
          theme,
          size,
        });
      } catch (err) {
        console.error("[Turnstile] Render error:", err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID);
      if (!script) {
        script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        isCancelled = true;
        if (widgetIdRef.current !== null && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // Ignore removal errors on unmount
          }
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      isCancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore removal errors on unmount
        }
        widgetIdRef.current = null;
      }
    };
  }, [effectiveSiteKey, theme, size]);

  return (
    <div
      ref={containerRef}
      className={`my-3 flex justify-center ${className}`}
    />
  );
});

export default TurnstileWidget;
