import { useEffect, useRef, useState } from "react";

const defaultSpeechToolbarState = {
  activeFieldLabel: "",
  colorMode: null,
  disabled: true,
  onError: null,
  onTranscript: null,
};

let currentSpeechToolbarId = null;
let currentSpeechToolbarState = defaultSpeechToolbarState;
const speechToolbarListeners = new Set();

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function notifySpeechToolbarListeners() {
  const snapshot = { ...currentSpeechToolbarState };
  speechToolbarListeners.forEach((listener) => listener(snapshot));
}

function registerSpeechToolbar(toolbarId, nextState) {
  currentSpeechToolbarId = toolbarId;
  currentSpeechToolbarState = {
    ...defaultSpeechToolbarState,
    ...nextState,
  };
  notifySpeechToolbarListeners();
}

function unregisterSpeechToolbar(toolbarId) {
  if (currentSpeechToolbarId !== toolbarId) {
    return;
  }

  currentSpeechToolbarId = null;
  currentSpeechToolbarState = defaultSpeechToolbarState;
  notifySpeechToolbarListeners();
}

function useSpeechToolbarState(fallbackColorMode) {
  const [toolbarState, setToolbarState] = useState(() => ({
    ...currentSpeechToolbarState,
    colorMode: currentSpeechToolbarState.colorMode || fallbackColorMode,
  }));

  useEffect(() => {
    const handleToolbarChange = (nextState) => {
      setToolbarState({
        ...nextState,
        colorMode: nextState.colorMode || fallbackColorMode,
      });
    };

    speechToolbarListeners.add(handleToolbarChange);
    handleToolbarChange(currentSpeechToolbarState);

    return () => {
      speechToolbarListeners.delete(handleToolbarChange);
    };
  }, [fallbackColorMode]);

  return toolbarState;
}

function getSpeechRecognitionErrorMessage(errorCode) {
  switch (errorCode) {
    case "audio-capture":
      return "No microphone was detected. Please check your device and try again.";
    case "network":
      return "Speech recognition needs a network connection in this browser.";
    case "no-speech":
      return "No speech was detected. Please try again.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Please allow it and try again.";
    default:
      return "Speech recognition failed. Please try again.";
  }
}

export default function SpeechInputButton({ ariaLabel = "Use voice input", className = "", disabled = false, lang = "en-US", onError, onTranscript, colorMode = "light", variant = "inline" }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition = getSpeechRecognitionConstructor();
  const isSupported = Boolean(SpeechRecognition);
  const isDarkMode = colorMode === "dark";
  const isFloatingButton = variant === "floating";
  const iconSizeClassName = isFloatingButton ? "h-7 w-7" : "h-4 w-4";
  const floatingButtonClassName =
    "inline-flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f8d24e] bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)] text-[#fff8f3] shadow-[0_20px_48px_-24px_rgba(43,3,7,0.82)] ring-[4px] ring-[#f8d24e] transition duration-200 hover:shadow-[0_24px_56px_-24px_rgba(43,3,7,0.9)] focus:outline-none focus:ring-[6px] focus:ring-[#f8d24e]/35 disabled:cursor-not-allowed disabled:opacity-60";
  const inlineButtonClassName = isDarkMode
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#f4eaea] shadow-[0_14px_30px_-18px_rgba(2,6,23,0.72)] transition duration-200 hover:border-[#f8d24e]/55 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a] focus:outline-none focus:ring-4 focus:ring-[#f8d24e]/18 disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7b0d15]/15 bg-white/92 text-[#7b0d15] shadow-[0_14px_30px_-18px_rgba(43,3,7,0.55)] transition duration-200 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] focus:outline-none focus:ring-4 focus:ring-[#f8d24e]/25 disabled:cursor-not-allowed disabled:opacity-60";
  const baseClassName = isFloatingButton
    ? floatingButtonClassName
    : inlineButtonClassName;
  const listeningClassName = isDarkMode
    ? "border-[#f8d24e] bg-[#f8d24e]/14 text-[#ffe28a] shadow-[0_18px_34px_-18px_rgba(248,210,78,0.45)]"
    : "border-[#f8d24e] bg-[#fff4dc] text-[#7b0d15] shadow-[0_18px_34px_-18px_rgba(248,210,78,0.9)]";

  useEffect(() => {
    return () => {
      if (!recognitionRef.current) {
        return;
      }

      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleClick = () => {
    if (!isSupported) {
      onError?.("Speech recognition isn't supported in this browser.");
      return;
    }

    if (disabled) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.resultIndex]?.[0]?.transcript?.trim() ||
        event.results[0]?.[0]?.transcript?.trim() ||
        "";

      if (transcript) {
        onTranscript?.(transcript);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onnomatch = () => {
      onError?.("I couldn't understand that. Please try again.");
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") {
        return;
      }

      onError?.(getSpeechRecognitionErrorMessage(event.error));
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      onError?.("Speech recognition couldn't start. Please try again.");
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <button type="button" className={`${baseClassName} ${isListening ? listeningClassName : ""} ${className}`.trim()} onClick={handleClick} aria-label={isListening ? "Stop voice input" : ariaLabel} aria-pressed={isListening} title={isListening ? "Stop voice input" : ariaLabel} disabled={disabled}>
        <span className={`relative ${iconSizeClassName}`}>
          <span aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out ${
              isListening
                ? "scale-75 -rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
          >
            <MicrophoneIcon className={iconSizeClassName} />
          </span>
          <span aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out ${
              isListening
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 rotate-90 opacity-0"
            }`}
          >
            <StopIcon className={iconSizeClassName} />
          </span>
        </span>
      </button>

      <span className="sr-only" role="status" aria-live="polite">
        {isListening ? "Listening for voice input." : ""}
      </span>
    </>
  );
}

export function SpeechInputToolbar({ activeFieldLabel, disabled = false, onError, onTranscript, colorMode = "light" }) {
  const toolbarIdRef = useRef(Symbol("speech-toolbar"));

  useEffect(() => {
    registerSpeechToolbar(toolbarIdRef.current, {
      activeFieldLabel,
      colorMode,
      disabled,
      onError,
      onTranscript,
    });

    return () => {
      unregisterSpeechToolbar(toolbarIdRef.current);
    };
  }, [activeFieldLabel, colorMode, disabled, onError, onTranscript]);

  return null;
}

export function FloatingSpeechInputAction({ className = "", colorMode = "light" }) {
  const speechToolbarState = useSpeechToolbarState(colorMode);
  const isDisabled =
    speechToolbarState.disabled ||
    !speechToolbarState.activeFieldLabel ||
    typeof speechToolbarState.onTranscript !== "function";

  return (
    <SpeechInputButton
      ariaLabel={
        speechToolbarState.activeFieldLabel
          ? `Use voice input for ${speechToolbarState.activeFieldLabel.toLowerCase()}`
          : "Select a supported input field for voice input"
      }
      className={className}
      colorMode={speechToolbarState.colorMode || colorMode}
      disabled={isDisabled}
      onError={speechToolbarState.onError}
      onTranscript={speechToolbarState.onTranscript}
      variant="floating"
    />
  );
}

function MicrophoneIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1.5a3.75 3.75 0 0 0-3.75 3.75v6a3.75 3.75 0 1 0 7.5 0v-6A3.75 3.75 0 0 0 12 1.5Z" />
      <path d="M6 10.5a.75.75 0 0 1 .75.75 5.25 5.25 0 1 0 10.5 0 .75.75 0 0 1 1.5 0 6.75 6.75 0 0 1-6 6.705V20.25h2.25a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-2.295a6.75 6.75 0 0 1-6-6.705A.75.75 0 0 1 6 10.5Z" />
    </svg>
  );
}

function StopIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 5.25A1.5 1.5 0 0 0 5.25 6.75v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H6.75Z" clipRule="evenodd"/>
    </svg>
  );
}