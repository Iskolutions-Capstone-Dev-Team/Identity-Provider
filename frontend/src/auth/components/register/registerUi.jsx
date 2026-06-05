import { forwardRef } from "react";
import { ChevronDownIcon, RoleIcon } from "./registerIcons";

export function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="pl-1 pt-2 text-xs text-red-100/95">{message}</p>;
}

export function FormLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white/90">
      {children}
      {required ? <span className="text-red-300"> *</span> : null}
    </label>
  );
}

export function RegisterSubmitButton({ children, compactTracking = false, disabled }) {
  const trackingClass = compactTracking ? "tracking-[0.04em]" : "tracking-[0.08em]";

  return (
    <button type="submit" disabled={disabled} className={`h-12 w-full rounded-xl border border-[#ffd700] bg-[#ffd700] text-sm font-semibold ${trackingClass} text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition duration-300 hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:border-[#f8d24e]/40 disabled:bg-[#f8d24e]/60 disabled:text-[#7b0d15]/70 disabled:shadow-none`}>
      {children}
    </button>
  );
}

export function RegisterTextField({ autoComplete, error = "", icon, label, placeholder, required = false, type, value, onBlur, onChange }) {
  return (
    <div>
      <FormLabel required={required}>{label}</FormLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
          {icon}
        </span>
        <input type={type} value={value} onChange={onChange} onBlur={onBlur} autoComplete={autoComplete} placeholder={placeholder} className={getInputClassName(error)}/>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function RegisterPasswordField({ error, icon, isVisible, label, placeholder, toggleLabel, value, visibleIcon, onBlur, onChange, onToggle }) {
  return (
    <div>
      <FormLabel required>{label}</FormLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b0d15]/60">
          {icon}
        </span>
        <input type={isVisible ? "text" : "password"} value={value} onChange={onChange} onBlur={onBlur} autoComplete="new-password" placeholder={placeholder} className={getInputClassName(error, true)}/>
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={toggleLabel}>
          {visibleIcon}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export const RoleSelectField = forwardRef(function RoleSelectField(
  {
    error,
    isDisabled,
    isOpen,
    options,
    placeholderIcon,
    value,
    onBlur,
    onSelect,
    onToggle,
  },
  ref,
) {
  const selectedOption = options.find((option) => option.id === value);
  const SelectedIcon = selectedOption?.Icon;

  return (
    <div ref={ref} className={`relative ${isOpen ? "z-[80]" : ""}`}>
      <div className={getSelectContainerClassName(error)}>
        <button type="button" onClick={onToggle} onBlur={() => {
            window.setTimeout(() => {
              if (!ref.current?.contains(document.activeElement)) {
                onBlur();
              }
            }, 0);
          }}
          className="flex h-12 w-full items-center justify-between gap-3 bg-transparent pl-4 pr-2 text-left outline-none"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={isDisabled}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-[#7b0d15]/60">
              {SelectedIcon ? <SelectedIcon /> : placeholderIcon}
            </span>
            <span className={`truncate text-sm ${
                value ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {selectedOption?.label || "Select your role"}
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#991b1b]">
            <ChevronDownIcon
              className={`h-5 w-5 transition duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-[90] max-h-40 overflow-y-auto rounded-xl border border-white/20 bg-white shadow-[0_28px_55px_-24px_rgba(15,23,42,0.88)] backdrop-blur-xl" role="listbox" aria-label="Select your role">
          <RoleOptionButton
            icon={<RoleIcon />}
            isSelected={!value}
            label="Select your role"
            onClick={() => onSelect("")}
          />

          {options.map((option) => (
            <RoleOptionButton
              key={option.id}
              icon={<option.Icon />}
              isSelected={value === option.id}
              label={option.label}
              onClick={() => onSelect(option.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

function RoleOptionButton({ icon, isSelected, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition duration-200 ${
        isSelected
          ? "bg-[#fff2d2] font-medium text-[#7b0d15]"
          : "text-slate-700 hover:bg-[#fff2d2] hover:text-[#7b0d15]"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function getInputClassName(hasError, hasActionButton = false) {
  return `h-12 w-full rounded-xl border bg-white/95 pl-12 pr-4 text-sm text-slate-800 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] outline-none transition duration-200 placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-300 focus:border-red-300 focus:ring-red-200/70"
      : "border-white/20 focus:border-[#ffd700] focus:ring-[#ffd700]/20"
  } ${hasActionButton ? "pr-12" : ""}`;
}

function getSelectContainerClassName(hasError) {
  return `relative rounded-xl border bg-white/95 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] transition duration-200 ${
    hasError
      ? "border-red-300 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-200/70"
      : "border-white/20 focus-within:border-[#ffd700] focus-within:ring-4 focus-within:ring-[#ffd700]/20"
  }`;
}