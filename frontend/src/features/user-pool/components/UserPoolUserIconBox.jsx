function UserPlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
    </svg>
  );
}

export default function UserPoolUserIconBox({ colorMode = "light", size = "md", variant = "boxed" }) {
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
        <UserPlusIcon className={plainIconClassName} />
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center border ${sizeClassName} ${boxedColorClassName}`} aria-hidden="true">
      <UserPlusIcon className={boxedIconClassName} />
    </span>
  );
}
