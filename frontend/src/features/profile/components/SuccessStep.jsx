import { getModalTheme } from "../../../components/modalTheme";

export default function SuccessStep({ colorMode = "light", showCurrentPassword = true }) {
  const { modalSectionClassName } = getModalTheme(colorMode);
  const isDarkMode = colorMode === "dark";
  const successIconClassName = isDarkMode
    ? "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-200 transition-[background-color,color] duration-500 ease-out"
    : "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-[background-color,color] duration-500 ease-out";
  const headingClassName = isDarkMode
    ? "mb-2 text-xl font-bold text-[#f6eaec] transition-colors duration-500 ease-out"
    : "mb-2 text-xl font-bold text-[#351018] transition-colors duration-500 ease-out";
  const descriptionClassName = isDarkMode
    ? "text-[#d6c3c7] transition-colors duration-500 ease-out"
    : "text-[#6f4f56] transition-colors duration-500 ease-out";
  const description = showCurrentPassword
    ? "Your password has been changed successfully. You will be logged out automatically for security reasons."
    : "Your password has been changed successfully. You can now sign in with your new password.";

  return (
    <div className="space-y-5">
      <section className={`${modalSectionClassName} text-center`}>
        <div className={successIconClassName}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
        </div>

        <h4 className={headingClassName}>Password Updated</h4>
        <p className={descriptionClassName}>{description}</p>
      </section>
    </div>
  );
}