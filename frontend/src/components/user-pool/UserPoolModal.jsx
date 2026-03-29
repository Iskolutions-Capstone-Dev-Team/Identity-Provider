import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";
import UserPoolModalSelect from "./UserPoolModalSelect";
import { getModalTheme } from "../modalTheme";

const initialFormData = {
  id: "",
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  suffix: "",
  status: "active",
  roles: [],
  roleIds: [],
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_VALUES = new Set(["active", "inactive", "suspended"]);

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();
  return STATUS_VALUES.has(normalizedValue) ? normalizedValue : "active";
};

const normalizeRoleNames = (roles) =>
  Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((role) => {
          if (typeof role === "string") {
            return role.trim();
          }

          return normalizeText(role?.role_name);
        })
        .filter(Boolean),
    ),
  );

const normalizeRoleIds = (roleIds) =>
  Array.from(
    new Set(
      (Array.isArray(roleIds) ? roleIds : [])
        .map((roleId) => Number.parseInt(roleId, 10))
        .filter((roleId) => Number.isInteger(roleId) && roleId > 0),
    ),
  );

const mapRoleNamesToIds = (roleNames, roleOptions) => {
  if (!Array.isArray(roleNames) || roleNames.length === 0) {
    return [];
  }

  const roleLookup = new Map(
    (Array.isArray(roleOptions) ? roleOptions : []).map((role) => [
      normalizeText(role?.role_name).toLowerCase(),
      role.id,
    ]),
  );

  return normalizeRoleIds(
    roleNames
      .map((roleName) => roleLookup.get(normalizeText(roleName).toLowerCase()))
      .filter((roleId) => roleId !== undefined),
  );
};

const extractErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  "Unable to save user changes.";

const createFormData = (user) => ({
  id: user?.id || "",
  email: user?.email || "",
  givenName: user?.givenName || "",
  middleName: user?.middleName || "",
  surname: user?.surname || "",
  suffix:
    user?.suffix ||
    user?.name_suffix ||
    user?.suffixName ||
    user?.suffix_name ||
    "",
  status: normalizeStatus(user?.status),
  roles: normalizeRoleNames(user?.roles),
  roleIds: normalizeRoleIds(user?.roleIds),
});

export default function UserPoolModal({ open, mode, user, onClose, onSubmit, colorMode = "light" }) {
  const availableRoles = useAllRoles();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isDarkMode = colorMode === "dark";
  const {
    modalBodyClassName,
    modalBodyStackClassName,
    modalBoxClassName,
    modalCloseButtonClassName,
    modalFooterActionsClassName,
    modalFooterClassName,
    modalHeaderClassName,
    modalHeaderDescriptionClassName,
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalLabelClassName,
    modalOptionalBadgeClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);
  const roleBadgeClassName = isDarkMode
    ? "inline-flex items-center gap-1 rounded-full border border-[#f8d24e]/25 bg-[#f8d24e]/12 px-3 py-1 text-xs font-semibold text-[#ffe28a]"
    : "inline-flex items-center gap-1 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]";
  const readOnlyRolesClassName = isDarkMode
    ? "min-h-24 w-full rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-4 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
  const emptyRolesClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";

  const [formData, setFormData] = useState(initialFormData);
  const [originalUser, setOriginalUser] = useState(initialFormData);
  const [error, setError] = useState("");
  const [rolesError, setRolesError] = useState(false);
  const [hasRoleSelectionChanged, setHasRoleSelectionChanged] = useState(false);

  useEffect(() => {
    if (!open) return;

    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setError("");
    setRolesError(false);
    setHasRoleSelectionChanged(false);
  }, [open, user]);

  useEffect(() => {
    if (
      !open ||
      hasRoleSelectionChanged ||
      formData.roleIds.length > 0 ||
      formData.roles.length === 0 ||
      availableRoles.length === 0
    ) {
      return;
    }

    const mappedRoleIds = mapRoleNamesToIds(formData.roles, availableRoles);
    if (mappedRoleIds.length === 0) {
      return;
    }

    setFormData((current) => ({
      ...current,
      roleIds: mappedRoleIds,
    }));

    setOriginalUser((current) =>
      current.roleIds.length > 0
        ? current
        : {
            ...current,
            roleIds: mappedRoleIds,
          },
    );
  }, [
    availableRoles,
    formData.roleIds.length,
    formData.roles,
    hasRoleSelectionChanged,
    open,
  ]);

  const selectedRoleIds = useMemo(() => {
    if (formData.roleIds.length > 0 || hasRoleSelectionChanged) {
      return formData.roleIds;
    }

    return mapRoleNamesToIds(formData.roles, availableRoles);
  }, [availableRoles, formData.roleIds, formData.roles, hasRoleSelectionChanged]);

  const displayedRoles = useMemo(() => {
    if (formData.roles.length > 0) {
      return formData.roles;
    }

    const roleLookup = new Map(
      availableRoles.map((role) => [role.id, role.role_name]),
    );

    return selectedRoleIds
      .map((roleId) => roleLookup.get(roleId))
      .filter(Boolean);
  }, [availableRoles, formData.roles, selectedRoleIds]);

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: field === "status" ? normalizeStatus(value) : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleRoleChange = (roleIds) => {
    const normalizedRoleIds = normalizeRoleIds(roleIds);
    const selectedRoles = availableRoles
      .filter((role) => normalizedRoleIds.includes(role.id))
      .map((role) => role.role_name);

    setHasRoleSelectionChanged(true);
    setFormData((current) => ({
      ...current,
      roleIds: normalizedRoleIds,
      roles: selectedRoles,
    }));

    if (normalizedRoleIds.length > 0) {
      setRolesError(false);
    }

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return onClose();

    if (selectedRoleIds.length === 0) {
      setRolesError(true);
      setError("At least one role must be selected.");
      return;
    }

    setRolesError(false);

    if (!STATUS_VALUES.has(formData.status)) {
      setError("Select a valid status.");
      return;
    }

    try {
      setError("");

      await onSubmit(
        {
          ...formData,
          roleIds: selectedRoleIds,
          roles: displayedRoles,
        },
        originalUser,
      );

      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  };

  if (!open) return null;

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderClassName}>
          <div className="flex items-start justify-between gap-4">
            <div className={`max-w-2xl ${isViewMode ? "pb-5 sm:pb-10" : ""}`}>
              <h3 className={modalHeaderTitleClassName}>
                {isViewMode ? "View User" : "Edit User"}
              </h3>
              <p className={modalHeaderDescriptionClassName}>
                {isViewMode
                  ? "View the user's account information."
                  : "Update the user's roles and account status."}
              </p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form id="user-pool-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <ErrorAlert message={error} onClose={() => setError("")} />

            {!isEditMode && (
              <section className={modalSectionClassName}>
                <div className="space-y-5">
                  <div>
                    <label className={modalLabelClassName}>User ID</label>
                    <input type="text" value={formData.id} readOnly className={modalReadOnlyInputClassName}/>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={modalLabelClassName}>Email</label>
                      <input type="email" value={formData.email} readOnly className={modalReadOnlyInputClassName}/>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>
                        First Name
                      </label>
                      <input type="text" value={formData.givenName} readOnly className={modalReadOnlyInputClassName}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className={modalLabelClassName}>
                        Middle Name
                      </label>
                      <label className={`${modalReadOnlyInputClassName} flex items-center gap-2`}>
                        <input type="text" value={formData.middleName} readOnly className="grow bg-transparent outline-none"/>
                        <span className={modalOptionalBadgeClassName}>
                          Optional
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>Last Name</label>
                      <input type="text" value={formData.surname} readOnly className={modalReadOnlyInputClassName}/>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>
                        Suffix
                      </label>
                      <label className={`${modalReadOnlyInputClassName} flex items-center gap-2`}>
                        <input type="text" value={formData.suffix} readOnly className="grow bg-transparent outline-none"/>
                        <span className={modalOptionalBadgeClassName}>
                          Optional
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className={modalSectionClassName}>
              <div className="space-y-5">
                <div>
                  <label className={modalLabelClassName}>
                    Role {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  {isViewMode ? (
                    <div className={readOnlyRolesClassName}>
                      {displayedRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displayedRoles.map((role, index) => (
                            <span key={`${role}-${index}`} className={roleBadgeClassName}>
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={emptyRolesClassName}>No content</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className={modalHelperTextClassName}>
                        Update the roles assigned to this user.
                      </p>
                      <MultiSelect
                        options={availableRoles}
                        selectedValues={selectedRoleIds}
                        onChange={handleRoleChange}
                        placeholder="Select roles"
                        variant="userpoolModal"
                        hasError={rolesError}
                        colorMode={colorMode}
                      />
                      {rolesError && (
                        <p className="mt-2 text-xs text-red-500">
                          At least one role is required
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className={modalLabelClassName}>
                    Status {!isViewMode && <span className="text-red-500">*</span>}
                  </label>
                  {isViewMode ? (
                    <select value={formData.status} onChange={(e) => handleFieldChange("status", e.target.value)} disabled className={`${modalReadOnlyInputClassName} cursor-not-allowed appearance-none`}>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <UserPoolModalSelect
                      value={formData.status}
                      onChange={(value) => handleFieldChange("status", value)}
                      options={STATUS_OPTIONS}
                      ariaLabel="Status"
                      colorMode={colorMode}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button form="user-pool-form" type="submit" className={modalPrimaryButtonClassName}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}