export default function NotificationListItem({ title, subtitle, meta, description, leading, actions, children, onClick, isMuted = false, truncateTitle = true, truncateSubtitle = true, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const baseItemClassName = isDarkMode
    ? "px-5 py-5 transition-[background-color,opacity,filter] duration-300 hover:bg-white/[0.03]"
    : "px-5 py-5 transition-[background-color,opacity,filter] duration-300 hover:bg-[#fffaf5]/80";
  const interactiveClassName = onClick
    ? isDarkMode
      ? "cursor-pointer focus-visible:bg-white/[0.04] focus-visible:outline-none"
      : "cursor-pointer focus-visible:bg-[#fff7ef] focus-visible:outline-none"
    : "";
  const mutedClassName = isMuted
    ? isDarkMode
      ? "bg-black/10 opacity-60 saturate-75"
      : "bg-[#7b0d15]/[0.04] opacity-65 saturate-75"
    : "";
  const itemClassName = [baseItemClassName, interactiveClassName, mutedClassName]
    .filter(Boolean)
    .join(" ");
  const titleClassName = isDarkMode
    ? `${truncateTitle ? "truncate" : "whitespace-nowrap"} text-base font-semibold text-[#f8edf0]`
    : `${truncateTitle ? "truncate" : "whitespace-nowrap"} text-base font-semibold text-[#5a0b12]`;
  const subtitleClassName = isDarkMode
    ? `${truncateSubtitle ? "truncate" : "whitespace-nowrap"} text-sm text-[#d7c2c8]`
    : `${truncateSubtitle ? "truncate" : "whitespace-nowrap"} text-sm text-[#7b0d15]`;
  const metaClassName = isDarkMode
    ? "inline-flex w-fit self-start items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#bfaeb4]"
    : "inline-flex w-fit self-start items-center rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#8f6f76]";
  const descriptionClassName = isDarkMode
    ? "whitespace-pre-wrap break-words text-sm leading-6 text-[#bfaeb4]"
    : "whitespace-pre-wrap break-words text-sm leading-6 text-[#75545c]";
  const interactiveProps = onClick
    ? {
        onClick,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick(event);
          }
        },
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <li className={itemClassName} {...interactiveProps}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          {leading ? <div className="shrink-0">{leading}</div> : null}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 space-y-1">
                <h3 className={titleClassName}>{title}</h3>
                {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
              </div>
              {meta ? <span className={metaClassName}>{meta}</span> : null}
            </div>

            {description ? (
              <p className={descriptionClassName}>{description}</p>
            ) : null}

            {children}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </li>
  );
}