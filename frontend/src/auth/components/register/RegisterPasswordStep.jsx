import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function RegisterPasswordStep({ errors, isSubmitting, showConfirmPassword, showPassword, values, onBlur, onChange, onSubmit, onToggleConfirmPassword, onTogglePassword }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-white">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
            <Lock className="size-5" />
          </span>
          <Input 
            type={showPassword ? "text" : "password"} 
            value={values.password} 
            onChange={(event) => onChange("password", event.target.value)} 
            onBlur={() => onBlur("password")}
            required 
            placeholder="Create your password"
            className={`h-12 w-full rounded-xl bg-white/95 pl-10 pr-10 text-base shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] transition duration-200 ${
              errors.password
                ? "border-destructive focus-visible:ring-destructive focus-visible:ring-4"
                : "border-white/20 focus-visible:border-[#ffd700] focus-visible:ring-4 focus-visible:ring-[#ffd700]/20"
            }`}
          />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password ? (
          <p className="pl-1 pt-2 text-xs text-red-300">
            {errors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-white">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b0d15]/60 z-10">
            <Lock className="size-5" />
          </span>
          <Input 
            type={showConfirmPassword ? "text" : "password"} 
            value={values.confirmPassword} 
            onChange={(event) => onChange("confirmPassword", event.target.value)} 
            onBlur={() => onBlur("confirmPassword")}
            required 
            placeholder="Confirm your password"
            className={`h-12 w-full rounded-xl bg-white/95 pl-10 pr-10 text-base shadow-[0_14px_35px_-25px_rgba(15,23,42,0.9)] transition duration-200 ${
              errors.confirmPassword
                ? "border-destructive focus-visible:ring-destructive focus-visible:ring-4"
                : "border-white/20 focus-visible:border-[#ffd700] focus-visible:ring-4 focus-visible:ring-[#ffd700]/20"
            }`}
          />
          <button type="button" onClick={onToggleConfirmPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition duration-300 hover:text-[#7b0d15]" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
            {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p className="pl-1 pt-2 text-xs text-red-300">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      <p className="pl-1 text-sm font-medium leading-none text-white/80">
        Use at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.
      </p>

      <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 w-full rounded-xl bg-[#ffd700] text-sm font-bold text-[#6f0f15] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] hover:bg-[#991b1b] hover:text-white transition duration-300">
        {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </Button>
    </form>
  );
}