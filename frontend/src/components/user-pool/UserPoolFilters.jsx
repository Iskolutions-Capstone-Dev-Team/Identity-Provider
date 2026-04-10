import { useEffect, useRef, useState } from "react";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { ADMIN_USER_TYPE, REGULAR_USER_TYPE } from "../../utils/userPoolAccess";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];
const userTypeOptions = [
  {
    value: REGULAR_USER_TYPE,
    label: "Users",
  },
  {
    value: ADMIN_USER_TYPE,
    label: "Admin",
  },
];

const statusOptionClassName =
  "w-full px-4 py-3 text-left text-sm font-medium text-[#4a1921] transition duration-200 hover:bg-[#fff1c7] hover:text-[#7b0d15]";
const selectedStatusOptionClassName =
  "bg-[#fff2d2] text-[#7b0d15]";

function getStatusLabel(status) {
  const matchedOption = statusOptions.find((option) => option.value === status);
  return matchedOption?.label || statusOptions[0].label;
}

function UserTypeIcon({ userType }) {
  if (userType === ADMIN_USER_TYPE) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}

export default function UserPoolFilters({ search, setSearch, userType, setUserType, status, setStatus, onCreate, showCreateAction = true, showAdminUserType = true, colorMode = "light" }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const statusDropdownRef = useRef(null);
  const selectedStatusLabel = getStatusLabel(status);
  const isDarkMode = colorMode === "dark";
  const visibleUserTypeOptions = showAdminUserType
    ? userTypeOptions
    : userTypeOptions.filter((option) => option.value !== ADMIN_USER_TYPE);
  const containerClassName = `flex flex-col gap-5 border-b pb-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,18rem)_auto_auto] lg:items-end ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const labelClassName = isDarkMode
    ? "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#f2dfe2] transition-colors duration-500 ease-out"
    : "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027] transition-colors duration-500 ease-out";
  const searchFieldClassName = isDarkMode
    ? "group flex h-14 items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] px-4 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/12"
    : "group flex h-14 items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15";
  const searchIconClassName = isDarkMode
    ? "h-5 w-5 shrink-0 text-white/45 transition-colors duration-500 ease-out group-focus-within:text-[#f8d24e]"
    : "h-5 w-5 shrink-0 text-[#7b0d15]/55 transition-colors duration-500 ease-out group-focus-within:text-[#7b0d15]";
  const searchInputClassName = isDarkMode
    ? "h-full w-full bg-transparent text-sm text-[#f6eaec] outline-none transition-colors duration-500 ease-out placeholder:text-[#a58d95]"
    : "h-full w-full bg-transparent text-sm text-[#4a1921] outline-none transition-colors duration-500 ease-out placeholder:text-[#9a7b81]";
  const statusDropdownClassName = isDarkMode
    ? "group relative h-14 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(31,20,29,0.92))] shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out hover:border-[#f8d24e]/30 focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/15"
    : "group relative h-14 rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,248,238,0.94))] shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out hover:border-[#e6c46a] focus-within:border-[#f8d24e] focus-within:ring-4 focus-within:ring-[#f8d24e]/20";
  const statusValueClassName = isDarkMode
    ? "truncate text-sm font-medium text-[#f6eaec] transition-colors duration-500 ease-out"
    : "truncate text-sm font-medium text-[#4a1921] transition-colors duration-500 ease-out";
  const statusChevronClassName = isDarkMode
    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8d24e]/12 text-[#f8d24e] transition duration-300 group-hover:bg-[#f8d24e]/18 group-focus-within:bg-[#f8d24e]/18"
    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2d2] text-[#991b1b] transition duration-300 group-hover:bg-[#ffe7a3] group-focus-within:bg-[#ffe7a3]";
  const statusMenuClassName = isDarkMode
    ? "absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.98),rgba(30,20,30,0.98))] shadow-[0_26px_50px_-30px_rgba(2,6,23,0.8)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 overflow-hidden rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,239,0.99))] shadow-[0_26px_50px_-30px_rgba(43,3,7,0.55)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const userTypeGroupClassName = isDarkMode
    ? "inline-grid h-14 w-fit grid-cols-2 gap-1.5 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] p-1.5 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)]"
    : "inline-grid h-14 w-fit grid-cols-2 gap-1.5 rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,247,239,0.94))] p-1.5 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)]";
  const getUserTypeButtonClassName = (isSelected) =>
    `flex h-full w-14 items-center justify-center rounded-[1rem] transition duration-300 ${
      isSelected
        ? isDarkMode
          ? "bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] text-white shadow-[0_16px_28px_-22px_rgba(2,6,23,0.82)]"
          : "bg-[#7b0d15] text-white shadow-[0_16px_28px_-22px_rgba(123,13,21,0.45)]"
        : isDarkMode
          ? "bg-white/[0.03] text-[#d6c3c7] hover:bg-[#f8d24e]/10 hover:text-[#ffe28a]"
          : "bg-white/75 text-[#5d3a41] hover:bg-[#fff4dc] hover:text-[#7b0d15]"
    } focus-visible:outline-none focus-visible:ring-2 ${
      isDarkMode
        ? "focus-visible:ring-[#f8d24e]/70"
        : "focus-visible:ring-[#7b0d15]/30"
    }`;
  const tooltipBubbleClassName = isDarkMode
    ? "pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.98),rgba(30,20,30,0.98))] px-3 py-2 text-xs font-semibold text-[#f6eaec] opacity-0 shadow-[0_18px_40px_-24px_rgba(2,6,23,0.8)] transition duration-200"
    : "pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,239,0.99))] px-3 py-2 text-xs font-semibold text-[#5d3a41] opacity-0 shadow-[0_18px_40px_-24px_rgba(43,3,7,0.35)] transition duration-200";
  const statusOptionThemeClassName = isDarkMode
    ? "w-full px-4 py-3 text-left text-sm font-medium text-[#f6eaec] transition duration-200 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : statusOptionClassName;
  const selectedStatusThemeClassName = isDarkMode
    ? "bg-[#7b0d15]/28 text-[#ffe28a]"
    : selectedStatusOptionClassName;
  const createButtonClassName = isDarkMode
    ? "inline-flex h-14 items-center justify-center rounded-2xl border border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(2,6,23,0.75)] transition-[background-color,background-image,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "inline-flex h-14 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]";

  useEffect(() => {
    if (!isStatusOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsStatusOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStatusOpen]);

  const handleStatusSelect = (value) => {
    setStatus(value);
    setIsStatusOpen(false);
  };

  const updateSearchValue = (value) => {
    setSearch(value);
  };

  const handleSearchChange = (event) => {
    updateSearchValue(event.target.value);
  };

  const handleSearchVoiceInput = (transcript) => {
    updateSearchValue(transcript);
  };

  return (
    <div className={containerClassName}>
      <div className="min-w-0">
        <SpeechInputToolbar
          activeFieldLabel="User Search"
          onTranscript={handleSearchVoiceInput}
          colorMode={colorMode}
        />
        <label className={labelClassName}>Who are you looking for?</label>
        <label className={searchFieldClassName}>
          <svg className={searchIconClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20 20-3.8-3.8" />
            </g>
          </svg>
          <input type="search" value={search} placeholder="Search by email, or name..." className={searchInputClassName} onChange={handleSearchChange}/>
        </label>
      </div>

      <div className="min-w-0">
        <label className={labelClassName}>Status</label>
        <div ref={statusDropdownRef} className={statusDropdownClassName}>
          <button type="button" className="flex h-full w-full items-center justify-between gap-3 rounded-[inherit] bg-transparent pl-4 pr-3 text-left" onClick={() => setIsStatusOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={isStatusOpen}>
            <span className={statusValueClassName}>
              {selectedStatusLabel}
            </span>

            <span className={statusChevronClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                className={`h-5 w-5 transition duration-300 ${
                  isStatusOpen ? "rotate-180" : ""
                }`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd"/>
              </svg>
            </span>
          </button>

          {isStatusOpen ? (
            <div className={statusMenuClassName} role="listbox" aria-label="Status">
              {statusOptions.map((option) => {
                const isSelected = option.value === status;

                return (
                  <button key={option.label} type="button" role="option" aria-selected={isSelected} onClick={() => handleStatusSelect(option.value)}
                    className={`${statusOptionThemeClassName} ${
                      isSelected ? selectedStatusThemeClassName : ""
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 lg:justify-self-start">
        <label className={labelClassName}>Account Type</label>
        <div className={userTypeGroupClassName} role="tablist" aria-label="Account Type">
          {visibleUserTypeOptions.map((option) => {
            const isSelected = option.value === userType;

            return (
              <div key={option.value} className="relative">
                <button type="button" className={getUserTypeButtonClassName(isSelected)}
                  onClick={() => {
                    setUserType(option.value);
                    setActiveTooltip(null);
                  }}
                  onMouseEnter={() => setActiveTooltip(option.value)}
                  onMouseLeave={() => setActiveTooltip((current) =>
                    current === option.value ? null : current,
                  )}
                  onFocus={() => setActiveTooltip(option.value)}
                  onBlur={() => setActiveTooltip((current) =>
                    current === option.value ? null : current,
                  )}
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={option.label}
                >
                  <UserTypeIcon userType={option.value} />
                </button>
                <span
                  className={`${tooltipBubbleClassName} ${
                    activeTooltip === option.value ? "opacity-100" : ""
                  }`}
                  role="tooltip"
                >
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateAction && (
        <div className="flex justify-end lg:justify-start">
          <button type="button" onClick={onCreate} className={createButtonClassName}>
            + Add User
          </button>
        </div>
      )}
    </div>
  );
}