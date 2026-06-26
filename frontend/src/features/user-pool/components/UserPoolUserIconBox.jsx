import { UserPlusIcon } from "./userpoolIcons";
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
