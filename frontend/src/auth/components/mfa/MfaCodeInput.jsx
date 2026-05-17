import { useEffect, useRef } from "react";
import { getDigits } from "./mfaInputUtils";

export default function MfaCodeInput({ value, onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

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
            const nextDigits = [...digits];
            nextDigits[index] = getDigits(event.target.value).slice(-1);
            onChange(nextDigits.join("").replace(/\s/g, ""));

            if (nextDigits[index] && index < 5) {
              inputsRef.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              inputsRef.current[index - 1]?.focus();
            }
          }}
          className="h-12 w-10 rounded-xl border border-white/20 bg-white/95 text-center text-lg font-semibold text-[#351018] outline-none transition focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-12"
          maxLength={1}
        />
      ))}
    </div>
  );
}