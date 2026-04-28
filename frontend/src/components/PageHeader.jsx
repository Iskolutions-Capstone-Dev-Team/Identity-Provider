export default function PageHeader({ title, description, icon, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const titleClassName = isDarkMode ? "text-white" : "text-[#111827]";
  const descriptionClassName = isDarkMode
    ? "text-[#d8c7cb]"
    : "text-[#64748b]";
  const iconClassName = isDarkMode ? "text-white" : titleClassName;
  const titleClasses = [
    "text-3xl font-black uppercase tracking-[0.02em] sm:text-4xl",
    titleClassName,
  ].join(" ");
  const descriptionClasses = [
    "mt-1 text-xs font-bold uppercase tracking-[0.16em] sm:text-sm",
    descriptionClassName,
  ].join(" ");
  const iconClasses = ["shrink-0", iconClassName].join(" ");

  return (
    <header className="flex w-full items-center gap-3 text-left sm:gap-4">
      {icon ? (
        <div className={iconClasses} aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className="min-w-0">
        <h1 className={titleClasses}>{title}</h1>
        <p className={descriptionClasses}>{description}</p>
      </div>
    </header>
  );
}