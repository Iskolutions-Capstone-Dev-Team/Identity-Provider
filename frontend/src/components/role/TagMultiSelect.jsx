import { useEffect, useMemo, useRef, useState } from "react";
import { getModalTheme } from "../modalTheme";

function TagIcon({ tag, image, sizeClass = "h-5 w-5", colorMode = "light" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials =
    typeof tag === "string" && tag.trim().length > 0
      ? tag.trim().charAt(0).toUpperCase()
      : "?";
  const isDarkMode = colorMode === "dark";
  const imageClassName = isDarkMode
    ? `${sizeClass} shrink-0 rounded-full border border-white/10 object-cover`
    : `${sizeClass} shrink-0 rounded-full border border-[#7b0d15]/10 object-cover`;
  const fallbackClassName = isDarkMode
    ? `${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#f8d24e]/12 text-xs font-semibold text-[#ffe28a]`
    : `${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#fff1d0] text-xs font-semibold text-[#7b0d15]`;

  if (image && !hasImageError) {
    return (
      <img src={image} alt={`${tag || "Tag"} logo`} className={imageClassName} onError={() => setHasImageError(true)}/>
    );
  }

  return (
    <span className={fallbackClassName}>
      {initials}
    </span>
  );
}

export default function TagMultiSelect({ options, selectedValues, onChange, placeholder, disabled = false, colorMode = "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const isDarkMode = colorMode === "dark";
  const {
    modalHelperTextClassName,
    modalReadOnlyInputClassName,
    modalSelectMenuClassName,
    modalSelectOptionClassName,
    modalSelectOptionSelectedClassName,
    modalSelectTriggerClassName,
  } = getModalTheme(colorMode);

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
    if (disabled) {
      setIsOpen(false);
      setSearchTerm("");
    }
  }, [disabled]);

  const selectedItems = useMemo(
    () =>
      options.filter((option) => selectedValues.includes(option.id)),
    [options, selectedValues],
  );

  const unselectedItems = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return options.filter((option) => {
      if (selectedValues.includes(option.id)) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      return (option.tag || "")
        .toLowerCase()
        .includes(normalizedSearchTerm);
    });
  }, [options, searchTerm, selectedValues]);

  const toggleOption = (value) => {
    if (disabled) {
      return;
    }

    const nextSelection = selectedValues.includes(value)
      ? selectedValues.filter((entry) => entry !== value)
      : [...selectedValues, value];

    onChange(nextSelection);
    setSearchTerm("");
  };

  const removeTag = (event, value) => {
    event.stopPropagation();
    onChange(selectedValues.filter((entry) => entry !== value));
  };

  const clearAll = (event) => {
    event.stopPropagation();
    onChange([]);
    setSearchTerm("");
  };

  const triggerClassName = disabled
    ? `${modalReadOnlyInputClassName} h-14 cursor-default`
    : `${modalSelectTriggerClassName} h-14`;
  const selectedTagClassName = isDarkMode
    ? "inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-[#f8d24e]/25 bg-[#f8d24e]/12 px-3 py-1 text-xs font-semibold text-[#ffe28a]"
    : "inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]";
  const removeButtonClassName = isDarkMode
    ? "text-[#ffe28a]/65 transition hover:text-[#ffe28a]"
    : "text-[#7b0d15]/65 transition hover:text-[#5a0b12]";
  const placeholderClassName = isDarkMode
    ? "text-sm text-[#a58d95]"
    : "text-sm text-[#9a7b81]";
  const searchInputClassName = isDarkMode
    ? `bg-transparent text-sm text-[#f4eaea] outline-none placeholder:text-[#a58d95] ${
        selectedItems.length > 0 ? "min-w-0 w-0 flex-1" : "min-w-[6rem] flex-1"
      }`
    : `bg-transparent text-sm text-[#4a1921] outline-none ${
        selectedItems.length > 0 ? "min-w-0 w-0 flex-1" : "min-w-[6rem] flex-1"
      }`;
  const controlsWrapClassName = isDarkMode
    ? "flex items-center gap-2 border-l border-white/10 pl-3"
    : "flex items-center gap-2 pl-3";
  const clearButtonClassName = isDarkMode
    ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f8d24e]/12 text-[#ffe28a] transition hover:bg-[#f8d24e]/18"
    : "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15] transition hover:bg-[#ffe7a3] hover:text-[#5a0b12]";
  const chevronWrapClassName = isDarkMode
    ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#f8d24e]/12 text-[#ffe28a]"
    : "flex h-9 w-9 items-center justify-center rounded-full bg-[#fff2d2] text-[#7b0d15]";
  const selectedLabelClassName = isDarkMode
    ? "px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#a58d95]"
    : "px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f6f76]";
  const dividerClassName = isDarkMode
    ? "mx-4 border-t border-white/10"
    : "mx-4 border-t border-[#7b0d15]/10";

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className={triggerClassName}
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
      >
        <div className="flex h-full items-center justify-between gap-3 px-4 text-left">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {selectedItems.map((item) => (
              <span key={item.id} className={selectedTagClassName}>
                <TagIcon tag={item.tag} image={item.image} sizeClass="h-4 w-4" colorMode={colorMode} />
                <span className="truncate">{item.tag}</span>
                {!disabled && (
                  <button type="button" className={removeButtonClassName} onClick={(event) => removeTag(event, item.id)} aria-label={`Remove ${item.tag}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </span>
            ))}

            {selectedItems.length === 0 && !searchTerm && (
              <span className={placeholderClassName}>{placeholder}</span>
            )}

            {!disabled && (
              <input type="text" value={searchTerm}
                className={searchInputClassName}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (!isOpen) {
                    setIsOpen(true);
                  }
                }}
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>

          <div className={controlsWrapClassName}>
            {!disabled && selectedValues.length > 0 && (
              <button type="button" className={clearButtonClassName} onClick={clearAll} aria-label="Clear selected tags">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            <span className={chevronWrapClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 transition duration-300 ${isOpen ? "rotate-180" : ""}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {!disabled && isOpen && (
        <div className={modalSelectMenuClassName}>
          {selectedItems.length > 0 && (
            <>
              <div className={selectedLabelClassName}>
                Selected
              </div>
              {selectedItems.map((option) => (
                <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`${modalSelectOptionClassName} ${modalSelectOptionSelectedClassName} flex items-center gap-3`}>
                  <TagIcon tag={option.tag} image={option.image} colorMode={colorMode} />
                  <span>{option.tag}</span>
                </button>
              ))}
              <div className={dividerClassName} />
            </>
          )}

          {unselectedItems.length > 0 ? (
            unselectedItems.map((option) => (
              <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`${modalSelectOptionClassName} flex w-full items-center gap-3`}>
                <TagIcon tag={option.tag} image={option.image} colorMode={colorMode} />
                <span>{option.tag}</span>
              </button>
            ))
          ) : (
            <div className={`${modalHelperTextClassName} px-4 py-4 text-center`}>
              {searchTerm ? "No results found" : "No tags available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}