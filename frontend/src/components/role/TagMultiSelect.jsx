import React, { useEffect, useRef, useState } from "react";

function TagIcon({ tag, image, sizeClass = "h-5 w-5" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials =
    typeof tag === "string" && tag.trim().length > 0
      ? tag.trim().charAt(0).toUpperCase()
      : "?";

  if (image && !hasImageError) {
    return (
      <img
        src={image}
        alt={`${tag || "Tag"} logo`}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 shrink-0`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </span>
  );
}

export default function TagMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder,
  disabled = false,
}) {
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

  const toggleOption = (value) => {
    if (disabled) return;

    const nextSelection = selectedValues.includes(value)
      ? selectedValues.filter((entry) => entry !== value)
      : [...selectedValues, value];

    onChange(nextSelection);
  };

  const removeTag = (event, value) => {
    if (disabled) return;
    event.stopPropagation();
    onChange(selectedValues.filter((entry) => entry !== value));
  };

  const clearAll = (event) => {
    if (disabled) return;
    event.stopPropagation();
    onChange([]);
  };

  const selectedItems = options.filter((option) =>
    selectedValues.includes(option.id),
  );

  const unselectedItems = options.filter(
    (option) =>
      !selectedValues.includes(option.id) &&
      (option.tag || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`flex items-center justify-between p-2 border border-gray-200 rounded-lg min-h-10.5 ${
          disabled
            ? "bg-gray-100 text-gray-600 cursor-default"
            : "bg-transparent text-gray-700 cursor-pointer"
        }`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedItems.length === 0 && !searchTerm && (
            <span className="text-gray-400 ml-1 text-sm">{placeholder}</span>
          )}

          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-medium"
            >
              <TagIcon tag={item.tag} image={item.image} sizeClass="h-4 w-4" />
              <span>{item.tag}</span>
              {!disabled && (
                <button
                  onClick={(event) => removeTag(event, item.id)}
                  className="hover:text-red-900 font-bold ml-1"
                >
                  x
                </button>
              )}
            </div>
          ))}

          <input
            className="outline-none bg-transparent ml-1 text-sm flex-1 min-w-12.5"
            value={searchTerm}
            onChange={(event) => {
              if (disabled) return;
              setSearchTerm(event.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={(event) => {
              if (!disabled) event.stopPropagation();
            }}
            readOnly={disabled}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2 px-1 border-l ml-2 border-gray-200">
          {!disabled && selectedValues.length > 0 && (
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-[#991b1b] text-lg"
            >
              x
            </button>
          )}
          <span
            className={`text-gray-400 transition-transform text-xs ${
              !disabled && isOpen ? "rotate-180" : ""
            }`}
          >
            {isOpen ? "^" : "v"}
          </span>
        </div>
      </div>

      {!disabled && isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto py-1">
          {selectedItems.length > 0 && (
            <div className="pb-2">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Selected
              </div>
              {selectedItems.map((option) => (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="checkbox w-5 h-5 rounded border-gray-300 bg-transparent checked:bg-[#991b1b] checked:border-red-900 checked:text-white focus:ring-0 mr-3 pointer-events-none"
                  />
                  <div className="flex items-center gap-2">
                    <TagIcon
                      tag={option.tag}
                      image={option.image}
                      sizeClass="h-5 w-5"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {option.tag}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-b border-gray-100 my-1 mx-2" />
            </div>
          )}

          {unselectedItems.length > 0 ? (
            unselectedItems.map((option) => (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  className="checkbox w-5 h-5 rounded border-gray-300 bg-transparent checked:bg-[#991b1b] checked:border-red-900 checked:text-white focus:ring-0 mr-3 pointer-events-none"
                />
                <div className="flex items-center gap-2">
                  <TagIcon
                    tag={option.tag}
                    image={option.image}
                    sizeClass="h-5 w-5"
                  />
                  <span className="text-sm text-gray-600">{option.tag}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-gray-400 text-center">
              {searchTerm ? "No results found" : "No tags available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}