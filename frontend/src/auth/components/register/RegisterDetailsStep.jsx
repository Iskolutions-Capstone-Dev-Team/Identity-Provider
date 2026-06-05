import { Link } from "react-router-dom";
import { EmailIcon, RoleIcon, UserIcon } from "./registerIcons";
import { roleOptions } from "./registerRoleOptions";
import { FieldError, FormLabel, RegisterSubmitButton, RegisterTextField, RoleSelectField } from "./registerUi";

export default function RegisterDetailsStep({ details, errors, isRoleMenuOpen, isSubmitting, loginPath, roleDropdownRef, onBlur, onChange, onRoleMenuToggle, onRoleSelect, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <RegisterTextField
        autoComplete="given-name"
        error={errors.firstName}
        icon={<UserIcon />}
        label="First Name"
        placeholder="Enter your first name"
        required
        type="text"
        value={details.firstName}
        onBlur={() => onBlur("firstName")}
        onChange={(event) => onChange("firstName", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <RegisterTextField
          autoComplete="additional-name"
          icon={<UserIcon />}
          label="Middle Name"
          placeholder="Enter your middle name"
          type="text"
          value={details.middleName}
          onChange={(event) => onChange("middleName", event.target.value)}
        />

        <div>
          <RegisterTextField
            autoComplete="honorific-suffix"
            icon={<UserIcon />}
            label="Suffix"
            placeholder="Enter your suffix"
            type="text"
            value={details.suffix}
            onChange={(event) => onChange("suffix", event.target.value)}
          />
          <p className="pl-1 pt-1 text-xs font-medium uppercase tracking-[0.08em] text-white/65">
            Optional
          </p>
        </div>
      </div>

      <RegisterTextField
        autoComplete="family-name"
        error={errors.lastName}
        icon={<UserIcon />}
        label="Last Name"
        placeholder="Enter your last name"
        required
        type="text"
        value={details.lastName}
        onBlur={() => onBlur("lastName")}
        onChange={(event) => onChange("lastName", event.target.value)}
      />

      <RegisterTextField
        autoComplete="email"
        error={errors.email}
        icon={<EmailIcon />}
        label="Email Address"
        placeholder="Enter your email address"
        required
        type="email"
        value={details.email}
        onBlur={() => onBlur("email")}
        onChange={(event) => onChange("email", event.target.value)}
      />

      <div>
        <FormLabel required>Select Your Role</FormLabel>
        <RoleSelectField
          error={errors.accountType}
          isDisabled={isSubmitting}
          isOpen={isRoleMenuOpen}
          options={roleOptions}
          placeholderIcon={<RoleIcon />}
          ref={roleDropdownRef}
          value={details.accountType}
          onBlur={() => onBlur("accountType")}
          onSelect={onRoleSelect}
          onToggle={onRoleMenuToggle}
        />
        <FieldError message={errors.accountType} />
      </div>

      <p className="pt-1 text-sm text-white/85">
        Already have an account?{" "}
        <Link to={loginPath} className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">
          Sign in
        </Link>
      </p>

      <RegisterSubmitButton disabled={isSubmitting}>
        {isSubmitting ? "SENDING OTP..." : "CONTINUE"}
      </RegisterSubmitButton>
    </form>
  );
}