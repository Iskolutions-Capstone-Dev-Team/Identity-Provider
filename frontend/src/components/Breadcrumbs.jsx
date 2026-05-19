import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [], colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const containerClassName = isDarkMode
    ? "inline-flex w-fit max-w-full self-start rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-2 shadow-[0_18px_36px_-30px_rgba(2,6,23,0.9)] backdrop-blur-md"
    : "inline-flex w-fit max-w-full self-start rounded-[1rem] border border-[#7b0d15]/10 bg-white/70 px-4 py-2 shadow-[0_18px_36px_-32px_rgba(43,3,7,0.5)] backdrop-blur-md";
  const linkClassName = isDarkMode
    ? "inline-flex items-center gap-1.5 text-[#cbb8bd] transition hover:text-[#ffe28a]"
    : "inline-flex items-center gap-1.5 text-[#7b0d15]/70 transition hover:text-[#7b0d15]";
  const currentClassName = isDarkMode
    ? "inline-flex items-center gap-1.5 font-semibold text-[#ffe28a]"
    : "inline-flex items-center gap-1.5 font-semibold text-[#7b0d15]";

  return (
    <nav className={`breadcrumbs text-xs ${containerClassName}`} aria-label="Breadcrumbs">
      <ul>
        {items.map((item) => {
          const content = (
            <>
              {item.icon ? (
                <span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
            </>
          );

          return (
            <li key={`${item.label}-${item.to || "current"}`}>
              {item.to ? (
                <Link to={item.to} className={linkClassName}>
                  {content}
                </Link>
              ) : (
                <span className={currentClassName}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}