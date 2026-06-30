export default function PageHeader({ title, description, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const titleClassName = isDarkMode ? "text-white" : "text-[#7b0d15]";
  const descriptionClassName = isDarkMode ? "text-[#d8c7cb]" : "text-[#7b0d15]";
  const titleClasses = [
    "text-3xl font-black uppercase tracking-[0.02em] sm:text-4xl",
    titleClassName,
  ].join(" ");
  const descriptionClasses = [
    "mt-1 text-xs font-bold first-letter:uppercase tracking-wider sm:text-sm",
    descriptionClassName,
  ].join(" ");

  return (
    <header className="flex w-full items-center text-left">
      <div className="min-w-0">
        <h1 className={titleClasses}>{title}</h1>
        <p className={descriptionClasses}>{description}</p>
      </div>
    </header>
  );
}