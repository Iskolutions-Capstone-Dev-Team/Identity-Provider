import { useEffect, useRef } from "react";
import { getDigits } from "./mfaInputUtils";

export default function MfaCodeInput({ value, onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const updateDigits = (nextDigits) => {
    onChange(nextDigits.join(""));
  };

  const focusInput = (index) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  useEffect(() => {
    if (!disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [disabled]);

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={digit.trim()}
          onChange={(event) => {
            const pastedDigits = getDigits(event.target.value);

            if (!pastedDigits) {
              return;
            }

            const nextDigits = [...digits];
            pastedDigits.split("").forEach((nextDigit, offset) => {
              const nextIndex = index + offset;

              if (nextIndex < nextDigits.length) {
                nextDigits[nextIndex] = nextDigit;
              }
            });

            updateDigits(nextDigits);
            focusInput(Math.min(index + pastedDigits.length, 5));
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
              const nextDigits = [...digits];

              if (nextDigits[index]) {
                nextDigits[index] = "";
                updateDigits(nextDigits);
                return;
              }

              if (index > 0) {
                nextDigits[index - 1] = "";
                updateDigits(nextDigits);
                focusInput(index - 1);
              }
              return;
            }

            if (event.key === "Delete") {
              event.preventDefault();
              const nextDigits = [...digits];
              nextDigits[index] = "";
              updateDigits(nextDigits);
              return;
            }

            if (event.key === "ArrowLeft" && index > 0) {
              event.preventDefault();
              focusInput(index - 1);
              return;
            }

            if (event.key === "ArrowRight" && index < 5) {
              event.preventDefault();
              focusInput(index + 1);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pastedDigits = getDigits(event.clipboardData.getData("text"));

            if (!pastedDigits) {
              return;
            }

            const nextDigits = [...digits];
            pastedDigits.split("").forEach((nextDigit, offset) => {
              const nextIndex = index + offset;

              if (nextIndex < nextDigits.length) {
                nextDigits[nextIndex] = nextDigit;
              }
            });

            updateDigits(nextDigits);
            focusInput(Math.min(index + pastedDigits.length, 5));
          }}
          className="h-12 w-10 rounded-xl border border-white/20 bg-white/95 text-center text-lg font-semibold text-[#351018] outline-none transition focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-12"
          maxLength={1}
        />
      ))}
    </div>
  );
}