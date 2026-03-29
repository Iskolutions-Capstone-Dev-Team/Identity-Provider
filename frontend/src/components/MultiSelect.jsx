import React, { useState, useRef, useEffect } from "react";

export default function MultiSelect({ options,
  selectedValues, onChange, placeholder, disabled = false, variant = "default", hasError = false, colorMode = "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const toggleOption = (id) => {
    if (disabled) return;
    const newSelection = selectedValues.includes(id)
      ? selectedValues.filter((val) => val !== id)
      : [...selectedValues, id];
    onChange(newSelection);
  };

  const removeTag = (e, id) => {
    if (disabled) return;
    e.stopPropagation();
    onChange(selectedValues.filter((val) => val !== id));
  };

  const clearAll = (e) => {
    if (disabled) return;
    e.stopPropagation();
    onChange([]);
  };

  const selectedItems = options.filter((opt) => selectedValues.includes(opt.id));
  const unselectedItems = options.filter(
    (opt) =>
      !selectedValues.includes(opt.id) &&
      opt.role_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const isUserPoolModalVariant = variant === "userpoolModal";
  const isDarkUserPoolModalVariant =
    isUserPoolModalVariant && colorMode === "dark";

  const triggerClassName = `flex items-center justify-between min-h-10.5 rounded-lg border p-2 ${
    isDarkUserPoolModalVariant
      ? disabled
        ? "border-white/10 bg-[rgba(10,15,24,0.72)] text-[#8e7f85] cursor-default"
        : `${
            hasError ? "border-red-400" : "border-white/10"
          } bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] cursor-pointer`
      : isUserPoolModalVariant
      ? disabled
        ? "border-[#7b0d15]/10 bg-[#fff7ef]/90 text-[#8f6f76] cursor-default"
        : `${
            hasError ? "border-red-400" : "border-[#7b0d15]/10"
          } bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] cursor-pointer`
      : disabled
        ? "border-gray-200 bg-gray-100 text-gray-600 cursor-default"
        : "border-gray-200 bg-transparent text-gray-700 cursor-pointer"
  }`;

  const placeholderClassName = isDarkUserPoolModalVariant
    ? "ml-1 text-sm text-[#a58d95]"
    : isUserPoolModalVariant
    ? "ml-1 text-sm text-[#9b7d84]"
    : "ml-1 text-sm text-gray-400";

  const selectedTagClassName = isDarkUserPoolModalVariant
    ? "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border border-[#f8d24e]/25 bg-[#f8d24e]/12 px-3 py-1 text-xs font-semibold text-[#ffe28a]"
    : isUserPoolModalVariant
    ? "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]"
    : "flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600";

  const inputClassName = isDarkUserPoolModalVariant
    ? `ml-1 bg-transparent text-sm text-[#f4eaea] outline-none placeholder:text-[#a58d95] ${
        selectedItems.length > 0 ? "min-w-0 w-0 flex-1" : "min-w-[3rem] flex-1"
      }`
    : isUserPoolModalVariant
    ? `ml-1 bg-transparent text-sm text-[#4a1921] outline-none placeholder:text-[#9b7d84] ${
        selectedItems.length > 0 ? "min-w-0 w-0 flex-1" : "min-w-[3rem] flex-1"
      }`
    : "ml-1 min-w-12.5 flex-1 bg-transparent text-sm outline-none";

  const toolsClassName = isDarkUserPoolModalVariant
    ? "ml-2 flex shrink-0 items-center gap-1.5 border-l border-white/10 pl-2 sm:ml-3 sm:gap-2 sm:pl-3"
    : isUserPoolModalVariant
    ? "ml-2 flex shrink-0 items-center gap-1.5 border-l border-[#7b0d15]/10 pl-2 sm:ml-3 sm:gap-2 sm:pl-3"
    : "ml-2 flex items-center gap-2 border-l border-gray-200 px-1";

  const clearButtonClassName = isDarkUserPoolModalVariant
    ? "text-[#a58d95] transition hover:text-[#f8d24e]"
    : isUserPoolModalVariant
    ? "text-[#a38189] transition hover:text-[#7b0d15]"
    : "text-lg text-gray-400 hover:text-[#991b1b]";

  const chevronWrapClassName = isDarkUserPoolModalVariant
    ? "inline-flex size-8 items-center justify-center rounded-full bg-[#f8d24e]/12 text-[#f8d24e] sm:size-9"
    : isUserPoolModalVariant
    ? "inline-flex size-8 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15] sm:size-9"
    : "text-gray-400";

  const dropdownClassName = isDarkUserPoolModalVariant
    ? "mt-2 max-h-60 w-full overflow-y-auto rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.98),rgba(27,18,28,0.98))] py-2 shadow-[0_26px_60px_-34px_rgba(2,6,23,0.82)] sm:absolute sm:z-50 sm:max-h-72"
    : isUserPoolModalVariant
    ? "mt-2 max-h-60 w-full overflow-y-auto rounded-[1.25rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,243,0.96))] py-2 shadow-[0_26px_60px_-34px_rgba(43,3,7,0.62)] sm:absolute sm:z-50 sm:max-h-72"
    : "absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl";

  const groupLabelClassName = isDarkUserPoolModalVariant
    ? "px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#a58d95]"
    : isUserPoolModalVariant
    ? "px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9b7d84]"
    : "px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400";

  const dividerClassName = isDarkUserPoolModalVariant
    ? "mx-3 my-1 border-b border-white/10"
    : isUserPoolModalVariant
    ? "mx-3 my-1 border-b border-[#7b0d15]/10"
    : "mx-2 my-1 border-b border-gray-100";

  const optionClassName = isDarkUserPoolModalVariant
    ? "group flex cursor-pointer items-center px-4 py-3 hover:bg-[#f8d24e]/10"
    : isUserPoolModalVariant
    ? "group flex cursor-pointer items-center px-4 py-3 hover:bg-[#fff7ef]"
    : "group flex cursor-pointer items-center px-3 py-2 hover:bg-gray-50";

  const optionTextClassName = isDarkUserPoolModalVariant
    ? "text-sm text-[#f4eaea]"
    : isUserPoolModalVariant
    ? "text-sm text-[#4a1921]"
    : "text-sm text-gray-600";

  const selectedOptionTextClassName = isDarkUserPoolModalVariant
    ? "text-sm font-medium text-[#ffe28a]"
    : isUserPoolModalVariant
    ? "text-sm font-medium text-[#4a1921]"
    : "text-sm font-medium text-gray-700";

  const emptyStateClassName = isDarkUserPoolModalVariant
    ? "p-4 text-center text-sm text-[#a58d95]"
    : isUserPoolModalVariant
    ? "p-4 text-center text-sm text-[#9b7d84]"
    : "p-3 text-center text-sm text-gray-400";
  const checkboxClassName = isDarkUserPoolModalVariant
    ? "checkbox w-5 h-5 rounded border-white/20 bg-transparent checked:border-[#f8d24e] checked:bg-[#7b0d15] checked:text-white focus:ring-0 mr-3 pointer-events-none"
    : "checkbox w-5 h-5 rounded border-gray-300 bg-transparent checked:bg-[#991b1b] checked:border-red-900 checked:text-white focus:ring-0 mr-3 pointer-events-none";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={triggerClassName}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedItems.length === 0 && !searchTerm && (
            <span className={placeholderClassName}>{placeholder}</span>
          )}

          {selectedItems.map((item) => (
            <div key={item.id} className={selectedTagClassName}>
              <span className="truncate">{item.role_name}</span>
              {!disabled && (
                <button type="button" onClick={(e) => removeTag(e, item.id)} className="ml-1 shrink-0 font-bold transition hover:text-[#5a0b12]">
                  x
                </button>
              )}
            </div>
          ))}

          <input className={inputClassName} value={searchTerm}
            onChange={(e) => {
              if (disabled) return;
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={(e) => {
              if (!disabled) e.stopPropagation();
            }}
            readOnly={disabled}
            disabled={disabled}
          />
        </div>

        <div className={toolsClassName}>
          {!disabled && selectedValues.length > 0 && (
            <button type="button" onClick={clearAll} className={`${clearButtonClassName} shrink-0`}>
              x
            </button>
          )}
          <span className={chevronWrapClassName}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className={`size-4 transition-transform duration-200 ${
                !disabled && isOpen ? "rotate-180" : ""
              }`}
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd"/>
            </svg>
          </span>
        </div>
      </div>

      {!disabled && isOpen && (
        <div className={dropdownClassName}>
          {selectedItems.length > 0 && (
            <div className="pb-2">
              <div className={groupLabelClassName}>
                Selected
              </div>
              {selectedItems.map((option) => (
                <div key={option.id} onClick={() => toggleOption(option.id)} className={optionClassName}>
                  <input type="checkbox" checked={true} readOnly className={checkboxClassName}/>
                  <span className={selectedOptionTextClassName}>
                    {option.role_name}
                  </span>
                </div>
              ))}
              <div className={dividerClassName} />
            </div>
          )}

          {unselectedItems.length > 0 ? (
            unselectedItems.map((option) => (
              <div key={option.id} onClick={() => toggleOption(option.id)} className={optionClassName}>
                <input type="checkbox" checked={false} readOnly className={checkboxClassName}/>
                <span className={optionTextClassName}>{option.role_name}</span>
              </div>
            ))
          ) : (
            <div className={emptyStateClassName}>
              {searchTerm ? "No results found" : "No tags available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}