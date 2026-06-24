export function AppClientIcon({ className = "h-6 w-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z" clipRule="evenodd" />
    </svg>
  );
}

export function AppClientOutlineIcon({ className = "h-6 w-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
}

export default function AppClientIconBox({ colorMode = "light", size = "md", variant = "boxed" }) {
  const isSmall = size === "sm";
  const sizeClassName = isSmall
    ? "h-10 w-10 rounded-[0.85rem]"
    : "h-12 w-12 rounded-[1rem]";
  const boxedIconClassName = isSmall ? "h-5 w-5" : "h-6 w-6";
  const plainIconClassName = isSmall ? "h-5 w-5" : "h-10 w-10";
  const boxedColorClassName =
    colorMode === "dark"
      ? "border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
      : "border-[#7b0d15]/10 bg-[#f8eef0] text-[#7b0d15]";
  const plainColorClassName =
    colorMode === "dark" ? "text-[#ffe28a]" : "text-[#fff0a8]";

  if (variant === "plain") {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${plainColorClassName}`} aria-hidden="true">
        <AppClientIcon className={plainIconClassName} />
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center border ${sizeClassName} ${boxedColorClassName}`} aria-hidden="true">
      <AppClientIcon className={boxedIconClassName} />
    </span>
  );
}