import { EyeIcon, EyeSlashIcon, PasswordIcon } from "./registerIcons";
import { RegisterPasswordField, RegisterSubmitButton } from "./registerUi";

export default function RegisterPasswordStep({ errors, isSubmitting, showConfirmPassword, showPassword, values, onBlur, onChange, onSubmit, onToggleConfirmPassword, onTogglePassword }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <RegisterPasswordField
        error={errors.password}
        icon={<PasswordIcon />}
        isVisible={showPassword}
        label="Password"
        placeholder="Create your password"
        toggleLabel={showPassword ? "Hide password" : "Show password"}
        value={values.password}
        visibleIcon={showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        onBlur={() => onBlur("password")}
        onChange={(event) => onChange("password", event.target.value)}
        onToggle={onTogglePassword}
      />

      <RegisterPasswordField
        error={errors.confirmPassword}
        icon={<PasswordIcon />}
        isVisible={showConfirmPassword}
        label="Confirm Password"
        placeholder="Confirm your password"
        toggleLabel={
          showConfirmPassword
            ? "Hide confirm password"
            : "Show confirm password"
        }
        value={values.confirmPassword}
        visibleIcon={showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
        onBlur={() => onBlur("confirmPassword")}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        onToggle={onToggleConfirmPassword}
      />

      <p className="pl-1 text-xs font-medium text-white/75">
        Use at least 8 characters with 1 uppercase letter, 1 number, and 1
        special character.
      </p>

      <RegisterSubmitButton disabled={isSubmitting} compactTracking>
        {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </RegisterSubmitButton>
    </form>
  );
}