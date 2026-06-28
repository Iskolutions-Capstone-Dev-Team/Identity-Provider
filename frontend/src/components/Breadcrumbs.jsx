import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [], colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const linkClassName = isDarkMode
    ? "inline-flex items-center gap-1.5 text-[#cbb8bd] transition hover:text-[#ffe28a]"
    : "inline-flex items-center gap-1.5 text-white/70 transition hover:text-white";
  const currentClassName = isDarkMode
    ? "inline-flex items-center gap-1.5 font-semibold text-[#ffe28a]"
    : "inline-flex items-center gap-1.5 font-semibold text-white";

  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("navbar-breadcrumbs"));
  }, []);

  const navClassName = isDarkMode
    ? "breadcrumbs text-xs lg:text-sm text-[#cbb8bd]"
    : "breadcrumbs text-xs lg:text-sm text-white/70";

  const content = (
    <nav className={navClassName} aria-label="Breadcrumbs">
      <ul>
        {items.map((item) => {
          const innerContent = (
            <>
              {item.icon ? (
                <span className="shrink-0 [&>svg]:size-4 lg:[&>svg]:size-[1.125rem]" aria-hidden="true">
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
                  {innerContent}
                </Link>
              ) : (
                <span className={currentClassName}>
                  {innerContent}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (portalTarget) {
    return createPortal(content, portalTarget);
  }

  return null;
}