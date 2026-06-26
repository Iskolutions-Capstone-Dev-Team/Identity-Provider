import { EditIcon, LockIcon } from "./profileIcons";

export default function ActionButtons({ openEdit, openPassword, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const wrapperClassName = `flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end ${
    isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
  }`;
  const secondaryButtonClassName = isDarkMode
    ? "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-[#f4eaea] shadow-none transition-[background-color,border-color,color] duration-500 ease-out hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]"
    : "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-5 text-sm font-semibold text-[#7b0d15] shadow-none transition-[background-color,border-color,color] duration-500 ease-out hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const primaryButtonClassName = isDarkMode
    ? "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(2,6,23,0.75)] transition-[background-color,background-image,border-color,color,box-shadow] duration-500 ease-out hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]";

  return (
    <div className={wrapperClassName}>
      <button type="button" onClick={openEdit} className={secondaryButtonClassName}>
        <EditIcon />
        Edit Profile
      </button>

      <button type="button" onClick={openPassword} className={primaryButtonClassName}>
        <LockIcon />
        Change Password
      </button>
    </div>
  );
}