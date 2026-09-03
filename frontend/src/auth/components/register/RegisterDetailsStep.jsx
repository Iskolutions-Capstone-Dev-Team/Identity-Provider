import { Link } from "react-router-dom";
import { User, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { FieldError, FormLabel, RegisterSubmitButton, RegisterTextField, RoleSelectField, RegisterSuffixSelectField } from "./registerUi";
import { SUFFIX_OPTIONS as suffixOptions } from "../../../utils/suffixOptions";

export default function RegisterDetailsStep({ details, errors, isRoleMenuOpen, isSubmitting, loginPath, roleDropdownRef, roleOptions, isLoadingRoles, onChange, onRoleMenuToggle, onRoleSelect, onSubmit }) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <RegisterTextField
        autoComplete="given-name"
        error={errors.firstName}
        icon={<User className="size-5" strokeWidth={1.5} />}
        label="First Name"
        placeholder="Enter your first name"
        required
        type="text"
        value={details.firstName}
        onChange={(event) => onChange("firstName", event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <RegisterTextField
          autoComplete="additional-name"
          icon={<User className="size-5" strokeWidth={1.5} />}
          label="Middle Name"
          placeholder="Enter your middle name"
          type="text"
          value={details.middleName}
          onChange={(event) => onChange("middleName", event.target.value)}
        />

        <div>
          <RegisterSuffixSelectField
            icon={<User className="size-5" strokeWidth={1.5} />}
            label={
              <div className="flex items-center justify-between">
                <span>Suffix</span>
                <Badge variant="secondary" className="px-1 py-0 h-4 text-[0.55rem]">OPTIONAL</Badge>
              </div>
            }
            placeholder="Enter your suffix"
            value={details.suffix}
            onChange={(val) => onChange("suffix", val === "N/A" ? "" : val)}
            options={suffixOptions}
          />
        </div>
      </div>

      <RegisterTextField
        autoComplete="family-name"
        error={errors.lastName}
        icon={<User className="size-5" strokeWidth={1.5} />}
        label="Last Name"
        placeholder="Enter your last name"
        required
        type="text"
        value={details.lastName}
        onChange={(event) => onChange("lastName", event.target.value)}
      />

      <RegisterTextField
        autoComplete="email"
        error={errors.email}
        icon={<Mail className="size-5" strokeWidth={1.5} />}
        label="Email Address"
        placeholder="Enter your email address"
        required
        type="email"
        value={details.email}
        onChange={(event) => onChange("email", event.target.value)}
      />

      <div>
        <FormLabel required>Select Your Role</FormLabel>
        <RoleSelectField
          error={errors.accountType}
          isDisabled={isSubmitting || isLoadingRoles}
          isOpen={isRoleMenuOpen}
          options={roleOptions || []}
          placeholderIcon={<ShieldCheck className="size-5" strokeWidth={1.5} />}
          ref={roleDropdownRef}
          value={details.accountType}
          onSelect={onRoleSelect}
          onToggle={onRoleMenuToggle}
        />
        <FieldError message={errors.accountType} />
      </div>

      <RegisterSubmitButton disabled={isSubmitting}>
        {isSubmitting ? "SENDING OTP..." : "CONTINUE"}
      </RegisterSubmitButton>

      <div className="flex items-center gap-4 text-xs text-white/55">
        <Separator className="flex-1 bg-white/15" />
        <span>or</span>
        <Separator className="flex-1 bg-white/15" />
      </div>

      <p className="text-center text-sm font-medium text-white/85">
        Already have an account?{" "}
        <Link to={loginPath} className="font-semibold text-[#ffd700] underline decoration-transparent transition duration-300 hover:decoration-[#ffd700]">
          Sign in
        </Link>
      </p>
    </form>
  );
}