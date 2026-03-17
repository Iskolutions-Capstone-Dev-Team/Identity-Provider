import { useEffect, useRef, useState } from "react";
import {
  userPoolModalSelectButtonClassName,
  userPoolModalSelectMenuClassName,
  userPoolModalSelectOptionClassName,
  userPoolModalSelectOptionSelectedClassName,
  userPoolModalSelectTriggerClassName,
} from "./modalTheme";

function getSelectedOption(options, value) {
  return options.find((option) => option.value === value) || options[0];
}

export default function UserPoolModalSelect({
  value,
  onChange,
  options,
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = getSelectedOption(options, value);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={userPoolModalSelectTriggerClassName}>
      <button
        type="button"
        className={userPoolModalSelectButtonClassName}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left text-sm font-medium text-[#4a1921]">
          {selectedOption?.label}
        </span>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2d2] text-[#991b1b] transition duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 transition duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div
          className={userPoolModalSelectMenuClassName}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`${userPoolModalSelectOptionClassName} ${
                  isSelected ? userPoolModalSelectOptionSelectedClassName : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
