import { modalSectionClassName } from "./modalTheme";

export default function SuccessStep() {
  return (
    <div className="space-y-5">
      <section className={`${modalSectionClassName} text-center`}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
        </div>

        <h4 className="mb-2 text-xl font-bold text-[#351018]">Password Updated</h4>
        <p className="text-[#6f4f56]">
          Your password has been changed successfully. You will be logged out
          automatically for security reasons.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-blue-200 bg-blue-50/80 p-5 shadow-[0_22px_45px_-36px_rgba(27,67,121,0.28)]">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          <div className="text-left">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Security Note:</span> For security
              purposes, you'll need to log in again with your new password on
              your next session.
            </p>
          </div>
        </div>
      </section>

      <section className={modalSectionClassName}>
        <div className="mt-1">
          <h5 className="mb-3 text-sm font-semibold text-[#5a0b12]">
            Security Activity Logged
          </h5>
          <div className="rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-sm font-medium text-[#351018]">
                  Password Change
                </p>
                <p className="text-xs text-[#8f6f76]">Just now</p>
              </div>
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Completed
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}