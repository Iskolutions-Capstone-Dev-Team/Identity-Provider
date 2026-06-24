function getOptionLabel(option) {
  return option?.role_name || option?.label || "Untitled role";
}

export default function UserPoolRoleRadioGroup({ options = [], selectedValue = null, onChange, colorMode = "light", disabled = false, name = "user-pool-role", allowEmpty = false, emptyOptionLabel = "No role assigned" }) {
  const isDarkMode = colorMode === "dark";
  const radioClassName = isDarkMode
    ? "radio h-5 w-5 border-white/20 bg-transparent text-[#7b0d15] checked:border-[#f8d24e] checked:bg-[#7b0d15]"
    : "radio h-5 w-5 border-[#7b0d15]/20 bg-transparent text-[#7b0d15] checked:border-[#7b0d15] checked:bg-[#7b0d15]";
  const emptyStateClassName = isDarkMode
    ? "rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-4 text-sm text-[#a58d95]"
    : "rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#8f6f76]";

  if (options.length === 0) {
    return (
      <div className={emptyStateClassName}>
        No roles available.
      </div>
    );
  }

  const selectableOptions = allowEmpty
    ? [{ id: null, label: emptyOptionLabel }, ...options]
    : options;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {selectableOptions.map((option, index) => {
        const isSelected = option.id === selectedValue;
        const cardClassName = `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
          isSelected
            ? isDarkMode
              ? "border-[#f8d24e]/35 bg-[#f8d24e]/12 text-[#ffe28a]"
              : "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
            : isDarkMode
              ? "border-white/10 bg-white/[0.04] text-[#d6c3c7]"
              : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41]"
        } ${
          disabled
            ? "cursor-default"
            : isDarkMode
              ? "cursor-pointer hover:border-[#f8d24e]/35 hover:bg-[#f8d24e]/10"
              : "cursor-pointer hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"
        }`;

        return (
          <label key={option.id ?? `empty-option-${index}`} className={cardClassName}>
            <input type="radio" name={name} className={radioClassName} checked={isSelected}
              onChange={() => {
                if (!disabled) {
                  onChange(option.id);
                }
              }}
              disabled={disabled}
            />
            <span className="break-words">{getOptionLabel(option)}</span>
          </label>
        );
      })}
    </div>
  );
}