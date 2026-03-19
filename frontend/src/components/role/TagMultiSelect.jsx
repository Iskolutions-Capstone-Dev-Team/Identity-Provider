import { useEffect, useMemo, useRef, useState } from "react";
import {
  modalHelperTextClassName,
  modalReadOnlyInputClassName,
  modalSelectMenuClassName,
  modalSelectOptionClassName,
  modalSelectOptionSelectedClassName,
  modalSelectTriggerClassName,
} from "../modalTheme";

function TagIcon({ tag, image, sizeClass = "h-5 w-5" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials =
    typeof tag === "string" && tag.trim().length > 0
      ? tag.trim().charAt(0).toUpperCase()
      : "?";

  if (image && !hasImageError) {
    return (
      <img src={image} alt={`${tag || "Tag"} logo`} className={`${sizeClass} shrink-0 rounded-full border border-[#7b0d15]/10 object-cover`} onError={() => setHasImageError(true)}/>
    );
  }

  return (
    <span className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#fff1d0] text-xs font-semibold text-[#7b0d15]`}>
      {initials}
    </span>
  );
}

export default function TagMultiSelect({ options, selectedValues, onChange, placeholder, disabled = false }) {
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
              <span key={item.id} className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]">
                <TagIcon tag={item.tag} image={item.image} sizeClass="h-4 w-4" />
                <span className="truncate">{item.tag}</span>
                {!disabled && (
                  <button type="button" className="text-[#7b0d15]/65 transition hover:text-[#5a0b12]" onClick={(event) => removeTag(event, item.id)} aria-label={`Remove ${item.tag}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </span>
            ))}

            {selectedItems.length === 0 && !searchTerm && (
              <span className="text-sm text-[#9a7b81]">{placeholder}</span>
            )}

            {!disabled && (
              <input type="text" value={searchTerm}
                className={`bg-transparent text-sm text-[#4a1921] outline-none ${
                  selectedItems.length > 0 ? "min-w-0 w-0 flex-1" : "min-w-[6rem] flex-1"
                }`}
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

          <div className="flex items-center gap-2 pl-3">
            {!disabled && selectedValues.length > 0 && (
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15] transition hover:bg-[#ffe7a3] hover:text-[#5a0b12]" onClick={clearAll} aria-label="Clear selected tags">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff2d2] text-[#7b0d15]">
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
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f6f76]">
                Selected
              </div>
              {selectedItems.map((option) => (
                <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`${modalSelectOptionClassName} ${modalSelectOptionSelectedClassName} flex items-center gap-3`}>
                  <TagIcon tag={option.tag} image={option.image} />
                  <span>{option.tag}</span>
                </button>
              ))}
              <div className="mx-4 border-t border-[#7b0d15]/10" />
            </>
          )}

          {unselectedItems.length > 0 ? (
            unselectedItems.map((option) => (
              <button key={option.id} type="button" onClick={() => toggleOption(option.id)} className={`${modalSelectOptionClassName} flex w-full items-center gap-3`}>
                <TagIcon tag={option.tag} image={option.image} />
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