import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";
import UserPoolModalSelect from "./UserPoolModalSelect";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import { getModalTheme } from "../modalTheme";
import { ADMIN_USER_TYPE, deriveRolesFromAppClients, getAccessibleAppClientIds, getAccessibleAppClientNames, getAdminRoleOptions, getAppClientSelectOptions } from "../../utils/userPoolAccess";

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
  accessibleClientIds: [],
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspend" },
];

const STATUS_VALUES = new Set(["active", "inactive", "suspended"]);
const STATUS_DISPLAY_LABELS = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();
  return STATUS_VALUES.has(normalizedValue) ? normalizedValue : "active";
};

const getStatusDisplayLabel = (status) =>
  STATUS_DISPLAY_LABELS[normalizeStatus(status)] || STATUS_DISPLAY_LABELS.active;

const normalizeRoleNames = (roles) =>
  Array.from(
    new Set(
      (Array.isArray(roles)
        ? roles
        : roles === null || roles === undefined
          ? []
          : [roles])
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
  accessibleClientIds: [],
});

export default function UserPoolModal({ open, mode, user, userType = "regular", appClientOptions = [], isLoadingAppClients = false, onClose, onSubmit, colorMode = "light" }) {
  const availableRoles = useAllRoles();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isDarkMode = colorMode === "dark";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const adminRoleOptions = getAdminRoleOptions(availableRoles);
  const appClientSelectOptions = getAppClientSelectOptions(appClientOptions, {
    includeAdminRoles: false,
  });
  const accessFieldLabel = isAdminView ? "Role" : "Accessible App Clients";
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
  const modalHeaderSpacingClassName =
    isViewMode
      ? `${modalHeaderClassName} !px-7 !pt-7 !pb-14 sm:!px-8 sm:!pt-8 sm:!pb-12`
      : `${modalHeaderClassName} !px-7 !pt-6 !pb-6 sm:!px-8 sm:!pt-7 sm:!pb-7`;
  const modalHeaderContentClassName = "max-w-xl pr-12 sm:pr-14";
  const modalHeaderDescriptionSpacingClassName =
    isViewMode
      ? `${modalHeaderDescriptionClassName} !mt-3 max-w-[18rem] leading-relaxed sm:!mt-4 sm:max-w-[28rem]`
      : `${modalHeaderDescriptionClassName} !mt-2 max-w-[18rem] leading-relaxed sm:!mt-3 sm:max-w-[28rem]`;

  const [formData, setFormData] = useState(initialFormData);
  const [originalUser, setOriginalUser] = useState(initialFormData);
  const [error, setError] = useState("");
  const [accessError, setAccessError] = useState(false);
  const [hasAccessSelectionChanged, setHasAccessSelectionChanged] = useState(false);

  useEffect(() => {
    if (!open) return;

    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setError("");
    setAccessError(false);
    setHasAccessSelectionChanged(false);
  }, [open, user]);

  useEffect(() => {
    if (
      !open ||
      isAdminView ||
      hasAccessSelectionChanged ||
      formData.accessibleClientIds.length > 0 ||
      formData.roles.length === 0 ||
      appClientOptions.length === 0
    ) {
      return;
    }

    const accessibleClientIds = getAccessibleAppClientIds(
      formData.roles,
      appClientOptions,
    );

    if (accessibleClientIds.length === 0) {
      return;
    }

    setFormData((current) =>
      current.accessibleClientIds.length > 0
        ? current
        : {
            ...current,
            accessibleClientIds,
          },
    );

    setOriginalUser((current) =>
      current.accessibleClientIds.length > 0
        ? current
        : {
            ...current,
            accessibleClientIds,
          },
    );
  }, [
    appClientOptions,
    formData.accessibleClientIds.length,
    formData.roles,
    hasAccessSelectionChanged,
    isAdminView,
    open,
  ]);

  useEffect(() => {
    if (
      !open ||
      hasAccessSelectionChanged ||
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
    hasAccessSelectionChanged,
    open,
  ]);

  const selectedRoleIds = useMemo(() => {
    if (formData.roleIds.length > 0 || hasAccessSelectionChanged) {
      return formData.roleIds;
    }

    return mapRoleNamesToIds(formData.roles, availableRoles);
  }, [availableRoles, formData.roleIds, formData.roles, hasAccessSelectionChanged]);

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

  const displayedAccessibleClients = useMemo(() => {
    return getAccessibleAppClientNames(formData.roles, appClientOptions);
  }, [appClientOptions, formData.roles]);

  const selectedAdminRoleId = selectedRoleIds[0] ?? null;

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

    setHasAccessSelectionChanged(true);
    setFormData((current) => ({
      ...current,
      roleIds: normalizedRoleIds,
      roles: selectedRoles,
    }));

    setAccessError(false);

    if (error) {
      setError("");
    }
  };

  const handleAppClientChange = (accessibleClientIds) => {
    setHasAccessSelectionChanged(true);
    setFormData((current) => ({
      ...current,
      accessibleClientIds,
    }));

    if (accessibleClientIds.length > 0) {
      setAccessError(false);
    }

    if (error) {
      setError("");
    }
  };

  const handleAdminRoleChange = (roleId) => {
    handleRoleChange([roleId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return onClose();

    const nextAccess = isAdminView
      ? {
          roleIds: selectedRoleIds,
          roleNames: displayedRoles,
        }
      : hasAccessSelectionChanged
        ? deriveRolesFromAppClients(
            formData.accessibleClientIds,
            appClientOptions,
            availableRoles,
            { includeAdminRoles: false },
          )
        : {
            roleIds: selectedRoleIds,
            roleNames: displayedRoles,
          };

    if (!isAdminView && nextAccess.roleIds.length === 0) {
      setAccessError(true);
      setError(
        "Selected app clients do not map to available roles yet.",
      );
      return;
    }

    setAccessError(false);

    if (!STATUS_VALUES.has(formData.status)) {
      setError("Select a valid status.");
      return;
    }

    try {
      setError("");

      await onSubmit(
        {
          ...formData,
          userType,
          roleId: selectedAdminRoleId,
          roleIds: nextAccess.roleIds,
          roles: nextAccess.roleNames,
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
        <div className={modalHeaderSpacingClassName}>
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className={modalHeaderContentClassName}>
              <h3 className={modalHeaderTitleClassName}>
                {isViewMode ? "View User" : "Edit User"}
              </h3>
              <p className={modalHeaderDescriptionSpacingClassName}>
                {isViewMode
                  ? "View the user's account information."
                  : isAdminView
                    ? "Update the user's role and account status."
                    : "Update the user's app access and account status."}
              </p>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
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

                  <div>
                    <label className={modalLabelClassName}>Email</label>
                    <input type="email" value={formData.email} readOnly className={modalReadOnlyInputClassName}/>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={modalLabelClassName}>
                        First Name
                      </label>
                      <input type="text" value={formData.givenName} readOnly className={modalReadOnlyInputClassName}/>
                    </div>

                    <div>
                      <label className={modalLabelClassName}>Last Name</label>
                      <input type="text" value={formData.surname} readOnly className={modalReadOnlyInputClassName}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    {accessFieldLabel}
                    {!isViewMode && !isAdminView ? (
                      <span className="text-red-500"> *</span>
                    ) : null}
                  </label>

                  {isViewMode ? (
                    <div className={readOnlyRolesClassName}>
                      {(isAdminView ? displayedRoles : displayedAccessibleClients).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(isAdminView ? displayedRoles : displayedAccessibleClients).map((item, index) => (
                            <span key={`${item}-${index}`} className={roleBadgeClassName}>
                              {item}
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
                        {isAdminView
                          ? "Select one role for this user, or leave it unassigned."
                          : "Choose which app clients this user can access."}
                      </p>
                      {isAdminView ? (
                        <UserPoolRoleRadioGroup
                          options={adminRoleOptions}
                          selectedValue={selectedAdminRoleId}
                          onChange={handleAdminRoleChange}
                          colorMode={colorMode}
                          name="edit-user-role"
                          allowEmpty
                          emptyOptionLabel="No role assigned"
                        />
                      ) : (
                        <MultiSelect
                          options={appClientSelectOptions}
                          selectedValues={formData.accessibleClientIds}
                          onChange={handleAppClientChange}
                          placeholder="Select app clients"
                          variant="userpoolModal"
                          hasError={accessError}
                          colorMode={colorMode}
                        />
                      )}
                      {!isAdminView && isLoadingAppClients && (
                        <p className={modalHelperTextClassName}>
                          Loading app clients...
                        </p>
                      )}
                      {!isAdminView && accessError && (
                        <p className="mt-2 text-xs text-red-500">
                          At least one app client is required
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
                    <input type="text" value={getStatusDisplayLabel(formData.status)} readOnly className={modalReadOnlyInputClassName}/>
                  ) : (
                    <UserPoolModalSelect
                      value={formData.status}
                      onChange={(value) => handleFieldChange("status", value)}
                      options={STATUS_OPTIONS}
                      selectedLabel={getStatusDisplayLabel(formData.status)}
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