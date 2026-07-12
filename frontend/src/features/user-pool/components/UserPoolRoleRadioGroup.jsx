import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldContent, FieldTitle, FieldLabel } from "@/components/ui/field";

function getOptionLabel(option) {
  return option?.role_name || option?.label || "Untitled role";
}

export default function UserPoolRoleRadioGroup({ options = [], selectedValue = null, onChange, colorMode = "light", disabled = false, name = "user-pool-role", allowEmpty = false, emptyOptionLabel = "No role assigned" }) {
  if (options.length === 0) {
    const emptyStateClassName = colorMode === "dark"
      ? "rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-4 text-sm text-[#a58d95]"
      : "rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#8f6f76]";
    return (
      <div className={emptyStateClassName}>
        No roles available.
      </div>
    );
  }

  const selectableOptions = allowEmpty
    ? [{ id: null, label: emptyOptionLabel }, ...options]
    : options;

  return (
    <RadioGroup 
      value={selectedValue || ""} 
      onValueChange={(val) => {
        if (!disabled) {
          onChange(val === "" ? null : val);
        }
      }} 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {selectableOptions.map((option, index) => {
        const optionId = option.id ?? `empty-option-${index}`;
        const optionValue = option.id ?? "";
        return (
          <FieldLabel htmlFor={`${name}-${optionId}`} key={optionId}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{getOptionLabel(option)}</FieldTitle>
              </FieldContent>
              <RadioGroupItem value={optionValue} id={`${name}-${optionId}`} disabled={disabled} />
            </Field>
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
}