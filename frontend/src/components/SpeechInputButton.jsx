import { useEffect, useRef, useState } from "react";

const baseClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7b0d15]/15 bg-white/92 text-[#7b0d15] shadow-[0_14px_30px_-18px_rgba(43,3,7,0.55)] transition duration-200 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] focus:outline-none focus:ring-4 focus:ring-[#f8d24e]/25 disabled:cursor-not-allowed disabled:opacity-60";
const listeningClassName =
  "border-[#f8d24e] bg-[#fff4dc] text-[#7b0d15] shadow-[0_18px_34px_-18px_rgba(248,210,78,0.9)]";

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
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

export default function SpeechInputButton({
  ariaLabel = "Use voice input",
  className = "",
  disabled = false,
  lang = "en-US",
  onError,
  onTranscript,
}) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition = getSpeechRecognitionConstructor();
  const isSupported = Boolean(SpeechRecognition);

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
      <button
        type="button"
        className={`${baseClassName} ${isListening ? listeningClassName : ""} ${className}`.trim()}
        onClick={handleClick}
        aria-label={isListening ? "Stop voice input" : ariaLabel}
        aria-pressed={isListening}
        title={isListening ? "Stop voice input" : ariaLabel}
        disabled={disabled}
      >
        {isListening ? <StopIcon /> : <MicrophoneIcon />}
      </button>

      <span className="sr-only" role="status" aria-live="polite">
        {isListening ? "Listening for voice input." : ""}
      </span>
    </>
  );
}

export function SpeechInputToolbar({
  activeFieldLabel,
  className = "",
  disabled = false,
  onError,
  onTranscript,
}) {
  const isSupported = Boolean(getSpeechRecognitionConstructor());

  if (!isSupported) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[1.15rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.92))] px-4 py-3 shadow-[0_18px_40px_-34px_rgba(43,3,7,0.45)] ${className}`.trim()}
    >
      <p className="text-xs font-medium leading-5 text-[#7b5560]">
        {activeFieldLabel ? (
          <>
            Voice target:{" "}
            <span className="font-semibold text-[#7b0d15]">
              {activeFieldLabel}
            </span>
            . Click another supported field to switch.
          </>
        ) : (
          "Select a supported field, then use the mic."
        )}
      </p>

      <SpeechInputButton
        ariaLabel={
          activeFieldLabel
            ? `Use voice input for ${activeFieldLabel.toLowerCase()}`
            : "Select a field for voice input"
        }
        disabled={disabled}
        onError={onError}
        onTranscript={onTranscript}
      />
    </div>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12 1.5a3.75 3.75 0 0 0-3.75 3.75v6a3.75 3.75 0 1 0 7.5 0v-6A3.75 3.75 0 0 0 12 1.5Z" />
      <path d="M6 10.5a.75.75 0 0 1 .75.75 5.25 5.25 0 1 0 10.5 0 .75.75 0 0 1 1.5 0 6.75 6.75 0 0 1-6 6.705V20.25h2.25a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-2.295a6.75 6.75 0 0 1-6-6.705A.75.75 0 0 1 6 10.5Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M6.75 5.25A1.5 1.5 0 0 0 5.25 6.75v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H6.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
