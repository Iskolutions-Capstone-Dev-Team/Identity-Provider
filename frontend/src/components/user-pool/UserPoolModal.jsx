import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";
import UserPoolModalSelect from "./UserPoolModalSelect";
import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import { getModalTheme } from "../modalTheme";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions, getAppClientNamesByIds } from "../../utils/userPoolAccess";

const initialFormData = {
  id: "",
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  suffix: "",
  status: "active",
  roleId: null,
  roles: [],
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

const normalizeRoleId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : null;
};

const normalizeClientIds = (clientIds) =>
  Array.from(new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)));

const normalizeRoleNames = (roles) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles
    : roles === null || roles === undefined
      ? []
      : [roles];

  return Array.from(
    new Set(
      normalizedRoles
        .map((role) => {
          if (typeof role === "string") {
            return role.trim();
          }

          return normalizeText(role?.role_name || role?.roleName || role?.name);
        })
        .filter(Boolean),
    ),
  );
};

const getStatusDisplayLabel = (status) =>
  STATUS_DISPLAY_LABELS[normalizeStatus(status)] || STATUS_DISPLAY_LABELS.active;

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
  roleId: normalizeRoleId(user?.roleId),
  roles: normalizeRoleNames(user?.roles),
  accessibleClientIds: normalizeClientIds(user?.accessibleClientIds),
});

export default function UserPoolModal({ open, mode, user, userType = "regular", appClientOptions = [], isLoadingAppClients = false, onClose, onSubmit, colorMode = "light" }) {
  const availableRoles = useAllRoles();
  const adminRoleOptions = getAdminRoleOptions(availableRoles);
  const appClientSelectOptions = getAllAppClientSelectOptions(appClientOptions);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isDarkMode = colorMode === "dark";
  const isAdminView = userType === ADMIN_USER_TYPE;
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
  const readOnlyAccessClassName = isDarkMode
    ? "min-h-24 w-full rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-4 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    : "min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-4 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";
  const emptyAccessClassName = isDarkMode
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

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setError("");
  }, [open, user]);

  const handleStatusChange = (value) => {
    setFormData((current) => ({
      ...current,
      status: normalizeStatus(value),
    }));

    if (error) {
      setError("");
    }
  };

  const handleAdminRoleChange = (roleId) => {
    const normalizedRoleId = normalizeRoleId(roleId);
    const selectedRole = adminRoleOptions.find(
      (role) => role.id === normalizedRoleId,
    );

    setFormData((current) => ({
      ...current,
      roleId: normalizedRoleId,
      roles: selectedRole ? [selectedRole.role_name] : [],
    }));

    if (error) {
      setError("");
    }
  };

  const handleAppClientChange = (accessibleClientIds) => {
    setFormData((current) => ({
      ...current,
      accessibleClientIds,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

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
        },
        originalUser,
      );

      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    }
  };

  if (!open) {
    return null;
  }

  const roleAccessItems =
    formData.roles.length > 0
      ? formData.roles
      : adminRoleOptions
          .filter((role) => role.id === formData.roleId)
          .map((role) => role.role_name);
  const regularAccessItems = getAppClientNamesByIds(
    formData.accessibleClientIds,
    appClientOptions,
  );
  const accessFieldLabel = isAdminView ? "Role" : "Accessible Clients";
  const accessItems = isAdminView ? roleAccessItems : regularAccessItems;

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
                    ? "Update the admin role and account status."
                    : "Update the account status and app-client access."}
              </p>
            </div>

            <button
              type="button"
              className={`${modalCloseButtonClassName} shrink-0`}
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                    <input type="text" value={formData.id} readOnly className={modalReadOnlyInputClassName} />
                  </div>

                  <div>
                    <label className={modalLabelClassName}>Email</label>
                    <input type="email" value={formData.email} readOnly className={modalReadOnlyInputClassName} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={modalLabelClassName}>
                        First Name
                      </label>
                      <input type="text" value={formData.givenName} readOnly className={modalReadOnlyInputClassName} />
                    </div>

                    <div>
                      <label className={modalLabelClassName}>Last Name</label>
                      <input type="text" value={formData.surname} readOnly className={modalReadOnlyInputClassName} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={modalLabelClassName}>
                        Middle Name
                      </label>
                      <label className={`${modalReadOnlyInputClassName} flex items-center gap-2`}>
                        <input type="text" value={formData.middleName} readOnly className="grow bg-transparent outline-none" />
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
                        <input type="text" value={formData.suffix} readOnly className="grow bg-transparent outline-none" />
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
                  </label>

                  {isViewMode ? (
                    <div className={readOnlyAccessClassName}>
                      {accessItems.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {accessItems.map((item, index) => (
                            <span key={`${item}-${index}`} className={roleBadgeClassName}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={emptyAccessClassName}>
                          {isAdminView ? "No role assigned" : "No clients selected"}
                        </span>
                      )}
                    </div>
                  ) : isAdminView ? (
                    <>
                      <p className={modalHelperTextClassName}>
                        Choose the role for this admin account.
                      </p>
                      <UserPoolRoleRadioGroup
                        options={adminRoleOptions}
                        selectedValue={formData.roleId}
                        onChange={handleAdminRoleChange}
                        colorMode={colorMode}
                        name="edit-user-role"
                        allowEmpty
                        emptyOptionLabel="No role assigned"
                      />
                    </>
                  ) : (
                    <>
                      <p className={modalHelperTextClassName}>
                        Choose which clients this user can access.
                      </p>
                      <MultiSelect
                        options={appClientSelectOptions}
                        selectedValues={formData.accessibleClientIds}
                        onChange={handleAppClientChange}
                        placeholder="Select app clients"
                        variant="userpoolModal"
                        colorMode={colorMode}
                      />
                      {isLoadingAppClients && (
                        <p className={modalHelperTextClassName}>
                          Loading app clients...
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
                    <input type="text" value={getStatusDisplayLabel(formData.status)} readOnly className={modalReadOnlyInputClassName} />
                  ) : (
                    <UserPoolModalSelect
                      value={formData.status}
                      onChange={handleStatusChange}
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