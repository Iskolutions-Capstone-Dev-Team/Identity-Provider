import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../../components/ui/input-otp";

export default function MfaCodeInput({ value, onChange, disabled = false, fullWidth = false }) {
  const containerClassName = fullWidth
    ? "flex justify-center w-full"
    : "flex justify-center";
    
  // Handle case where value might be passed as an array (e.g. from tests)
  const stringValue = typeof value === "string" ? value : (value || []).join("");

  return (
    <div className={containerClassName}>
      <InputOTP id="mfa-code" maxLength={6} value={stringValue} onChange={onChange} disabled={disabled} autoFocus>
        <InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <InputOTPSlot 
              key={index} 
              index={index} 
              className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800"
            />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator className="text-white/80" />
        <InputOTPGroup>
          {[3, 4, 5].map((index) => (
            <InputOTPSlot 
              key={index} 
              index={index} 
              className="w-10 h-12 text-lg sm:w-14 sm:h-16 sm:text-2xl bg-white text-slate-800"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}