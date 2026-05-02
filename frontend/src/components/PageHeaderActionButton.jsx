export default function PageHeaderActionButton({ children, colorMode = "light", onClick }) {
  const isDarkMode = colorMode === "dark";
  const className = isDarkMode
    ? "inline-flex h-14 shrink-0 items-center justify-center rounded-2xl border border-[#f8d24e]/30 bg-[linear-gradient(135deg,#7b0d15_0%,#4a121b_100%)] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(2,6,23,0.75)] transition-[background-color,background-image,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-none hover:bg-[#f8d24e] hover:text-[#7b0d15]"
    : "inline-flex h-14 shrink-0 items-center justify-center rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_-26px_rgba(123,13,21,0.6)] transition-[background-color,border-color,color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5 hover:border-[#f8d24e] hover:bg-[#f8d24e] hover:text-[#7b0d15]";

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}