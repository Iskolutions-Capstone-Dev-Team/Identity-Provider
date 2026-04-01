import { getModalTheme } from "./modalTheme";

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
  const infoCardClassName = isDarkMode
    ? "rounded-[1.5rem] border border-sky-400/20 bg-sky-400/10 p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out"
    : "rounded-[1.5rem] border border-blue-200 bg-blue-50/80 p-5 shadow-[0_22px_45px_-36px_rgba(27,67,121,0.28)] transition-[background-color,border-color,box-shadow] duration-500 ease-out";
  const infoIconClassName = isDarkMode
    ? "mt-0.5 h-5 w-5 shrink-0 text-sky-200 transition-colors duration-500 ease-out"
    : "mt-0.5 h-5 w-5 shrink-0 text-blue-600 transition-colors duration-500 ease-out";
  const infoTextClassName = isDarkMode
    ? "text-sm text-sky-100 transition-colors duration-500 ease-out"
    : "text-sm text-blue-800 transition-colors duration-500 ease-out";
  const activityTitleClassName = isDarkMode
    ? "mb-3 text-sm font-semibold text-[#f7dadd] transition-colors duration-500 ease-out"
    : "mb-3 text-sm font-semibold text-[#5a0b12] transition-colors duration-500 ease-out";
  const activityCardClassName = isDarkMode
    ? "rounded-[1rem] bg-[linear-gradient(180deg,rgba(9,14,25,0.78),rgba(22,28,40,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[background-color,box-shadow] duration-500 ease-out"
    : "rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-[background-color,box-shadow] duration-500 ease-out";
  const activityNameClassName = isDarkMode
    ? "text-sm font-medium text-[#f4eaea] transition-colors duration-500 ease-out"
    : "text-sm font-medium text-[#351018] transition-colors duration-500 ease-out";
  const activityTimeClassName = isDarkMode
    ? "text-xs text-[#c7adb4] transition-colors duration-500 ease-out"
    : "text-xs text-[#8f6f76] transition-colors duration-500 ease-out";
  const statusBadgeClassName = isDarkMode
    ? "inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 transition-[background-color,border-color,color] duration-500 ease-out"
    : "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-[background-color,border-color,color] duration-500 ease-out";
  const description = showCurrentPassword
    ? "Your password has been changed successfully. You will be logged out automatically for security reasons."
    : "Your password has been changed successfully. You can now sign in with your new password.";
  const securityNote = showCurrentPassword
    ? "For security purposes, you'll need to log in again with your new password on your next session."
    : "Use your updated password the next time you access your account.";
  const activityName = showCurrentPassword
    ? "Password Change"
    : "Password Reset";

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

      <section className={infoCardClassName}>
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className={infoIconClassName} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          <div className="text-left">
            <p className={infoTextClassName}>
              <span className="font-semibold">Security Note:</span>{" "}
              {securityNote}
            </p>
          </div>
        </div>
      </section>

      <section className={modalSectionClassName}>
        <div className="mt-1">
          <h5 className={activityTitleClassName}>Security Activity Logged</h5>
          <div className={activityCardClassName}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className={activityNameClassName}>{activityName}</p>
                <p className={activityTimeClassName}>Just now</p>
              </div>
              <span className={statusBadgeClassName}>Completed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}