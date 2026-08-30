import { Checkbox } from "../../../components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "../../../components/ui/field";
import { ShieldLock } from "lucide-react";

export default function MfaRememberDevice({ checked, onCheckedChange }) {
  return (
    <FieldGroup className="w-full">
      <FieldLabel htmlFor="remember-device" className="relative p-0 border-white/10 bg-white/5 dark:has-data-checked:!border-[#ffd700]/40 dark:has-data-checked:!bg-[#ffd700]/10 has-data-checked:!border-[#ffd700]/40 has-data-checked:!bg-[#ffd700]/10 hover:bg-white/10 cursor-pointer transition-colors">
        <Field orientation="horizontal" className="items-center justify-between w-full">
          <FieldTitle className="flex items-center gap-3">
            <ShieldLock className="size-5 text-white/80 group-has-data-checked/field-label:text-[#ffd700]" strokeWidth={2} />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-semibold text-white">Remember this device</span>
              <span className="text-white/60 text-xs font-normal">Skip MFA for 30 days</span>
            </div>
          </FieldTitle>
          <Checkbox
            id="remember-device"
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="size-5 rounded-sm border-white/50 dark:data-checked:!bg-[#ffd700] data-checked:!bg-[#ffd700] dark:data-checked:!border-[#ffd700] data-checked:!border-[#ffd700] data-checked:!text-[#7b0d15]"
          />
        </Field>
      </FieldLabel>
    </FieldGroup>
  );
}
