import { CheckIcon } from "./ForgotPasswordIcons";

export default function ForgotPasswordSuccessStep() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#7b0d15]/10 bg-white p-6 text-center shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)]">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
          <CheckIcon />
        </div>
        <h4 className="mb-2 text-xl font-bold text-[#351018]">Password Updated</h4>
        <p className="text-sm text-[#6f4f56]">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
      </section>
    </div>
  );
}