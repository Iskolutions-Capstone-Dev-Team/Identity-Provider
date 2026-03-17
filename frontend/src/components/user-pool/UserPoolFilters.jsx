import { useEffect, useRef, useState } from "react";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const statusOptionClassName =
  "w-full px-4 py-3 text-left text-sm font-medium text-[#4a1921] transition duration-200 hover:bg-[#fff1c7] hover:text-[#7b0d15]";
const selectedStatusOptionClassName =
  "bg-[#fff2d2] text-[#7b0d15]";

function getStatusLabel(status) {
  const matchedOption = statusOptions.find((option) => option.value === status);
  return matchedOption?.label || statusOptions[0].label;
}

export default function UserPoolFilters({ search, setSearch, status, setStatus, onCreate }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const selectedStatusLabel = getStatusLabel(status);

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

  return (
    <div className="flex flex-col gap-5 border-b border-[#7b0d15]/10 pb-6 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,19rem)_auto] lg:items-end">
      <div className="min-w-0">
        <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">Who are you looking for?</label>
        <label className="group flex h-14 items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15">
          <svg className="h-5 w-5 shrink-0 text-[#7b0d15]/55 transition duration-300 group-focus-within:text-[#7b0d15]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20 20-3.8-3.8" />
            </g>
          </svg>
          <input type="search" value={search} placeholder="Search by email, or name..." className="h-full w-full bg-transparent text-sm text-[#4a1921] outline-none placeholder:text-[#9a7b81]" onChange={(e) => setSearch(e.target.value)}/>
        </label>
      </div>

      <div className="min-w-0">
        <label className="mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027]">Status</label>
        <div ref={statusDropdownRef} className="group relative h-14 rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,248,238,0.94))] shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 hover:border-[#e6c46a] focus-within:border-[#f8d24e] focus-within:ring-4 focus-within:ring-[#f8d24e]/20">
          <button type="button" className="flex h-full w-full items-center justify-between gap-3 rounded-[inherit] bg-transparent pl-4 pr-3 text-left" onClick={() => setIsStatusOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={isStatusOpen}>
            <span className="truncate text-sm font-medium text-[#4a1921]">
              {selectedStatusLabel}
            </span>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2d2] text-[#991b1b] transition duration-300 group-hover:bg-[#ffe7a3] group-focus-within:bg-[#ffe7a3]">
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
            <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 overflow-hidden rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,239,0.99))] shadow-[0_26px_50px_-30px_rgba(43,3,7,0.55)] backdrop-blur-xl" role="listbox" aria-label="Status">
              {statusOptions.map((option) => {
                const isSelected = option.value === status;

                return (
                  <button key={option.label} type="button" role="option" aria-selected={isSelected} onClick={() => handleStatusSelect(option.value)}
                    className={`${statusOptionClassName} ${
                      isSelected ? selectedStatusOptionClassName : ""
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

      <div className="flex justify-end lg:justify-start">
        <button type="button" onClick={onCreate} className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition duration-300 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]">
          + Add User
        </button>
      </div>
    </div>
  );
}