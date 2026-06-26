import { getModalTheme } from "../../../components/modalTheme";
import { SuccessIcon } from "./profileIcons";

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
          <SuccessIcon />
        </div>

        <h4 className={headingClassName}>Password Updated</h4>
        <p className={descriptionClassName}>{description}</p>
      </section>
    </div>
  );
}