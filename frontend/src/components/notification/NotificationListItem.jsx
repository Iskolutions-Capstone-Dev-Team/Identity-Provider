export default function NotificationListItem({ title, subtitle, meta, description, leading, actions, children, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const itemClassName = isDarkMode
    ? "px-5 py-5 transition-colors duration-300 hover:bg-white/[0.03]"
    : "px-5 py-5 transition-colors duration-300 hover:bg-[#fffaf5]/80";
  const titleClassName = isDarkMode
    ? "text-base font-semibold text-[#f8edf0]"
    : "text-base font-semibold text-[#5a0b12]";
  const subtitleClassName = isDarkMode
    ? "break-all text-sm text-[#d7c2c8]"
    : "break-all text-sm text-[#7b0d15]";
  const metaClassName = isDarkMode
    ? "inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#bfaeb4]"
    : "inline-flex items-center rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-medium text-[#8f6f76]";
  const descriptionClassName = isDarkMode
    ? "whitespace-pre-wrap break-words text-sm leading-6 text-[#bfaeb4]"
    : "whitespace-pre-wrap break-words text-sm leading-6 text-[#75545c]";

  return (
    <li className={itemClassName}>
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