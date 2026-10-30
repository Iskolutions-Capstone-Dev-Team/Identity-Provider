import { Checkbox } from "../../../components/ui/checkbox";
import { ShieldLock } from "lucide-react";

export default function MfaRememberDevice({ checked, onCheckedChange }) {
  return (
    <label
      htmlFor="remember-device"
      className={`group/remember relative flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 transition duration-300 ${
        checked
          ? "border-[#ffd700]/70 bg-[#ffd700]/15 hover:bg-[#ffd700]/20"
          : "border-white/12 bg-white/6 hover:border-[#ffd700]/55 hover:bg-[#ffd700]/12"
      }`}
    >
      <div className="flex items-center gap-3">
        <ShieldLock
          className={`size-5 transition duration-300 ${
            checked
              ? "text-[#ffd700]"
              : "text-white/70 group-hover/remember:text-[#ffd700]"
          }`}
          strokeWidth={2}
        />
        <div className="flex flex-col items-start gap-0.5">
          <span
            className={`text-sm font-semibold transition duration-300 ${
              checked
                ? "text-[#ffd700]"
                : "text-white group-hover/remember:text-[#ffd700]"
            }`}
          >
            Remember this device
          </span>
          <span
            className={`text-xs transition duration-300 ${
              checked
                ? "text-[#ffd700]/80"
                : "text-white/60 group-hover/remember:text-white/85"
            }`}
          >
            Skip MFA for 7 days
          </span>
        </div>
      </div>

      <Checkbox
        id="remember-device"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={`size-5 rounded-md transition duration-300 ${
          checked
            ? "!border-[#ffd700] !bg-[#ffd700] !text-[#7b0d15]"
            : "border-white/40 group-hover/remember:border-[#ffd700]/70"
        }`}
      />
    </label>
  );
}
