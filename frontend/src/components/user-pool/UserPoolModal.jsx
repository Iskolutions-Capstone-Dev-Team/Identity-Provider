import { useEffect, useMemo, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";

const initialFormData = {
  id: "",
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  status: "active",
  roles: [],
  roleIds: [],
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

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
  status: normalizeText(user?.status).toLowerCase() || "active",
  roles: normalizeRoleNames(user?.roles),
  roleIds: normalizeRoleIds(user?.roleIds),
});

export default function UserPoolModal({
  open,
  mode,
  user,
  onClose,
  onSubmit,
}) {
  const availableRoles = useAllRoles();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState(initialFormData);
  const [originalUser, setOriginalUser] = useState(initialFormData);
  const [error, setError] = useState("");
  const [hasRoleSelectionChanged, setHasRoleSelectionChanged] = useState(false);

  useEffect(() => {
    if (!open) return;

    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setError("");
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

  const readOnlyInputClassName =
    "w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700";

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
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

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return onClose();

    if (selectedRoleIds.length === 0) {
      setError("At least one role must be selected.");
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

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {isViewMode ? "View User" : "Edit User"}
              </h3>
              <p className="text-white/90 mt-1">
                {isViewMode
                  ? "View the user's account information."
                  : "Update the user's roles and account status."}
              </p>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form
          id="user-pool-form"
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
          onSubmit={handleSubmit}
        >
          <ErrorAlert message={error} onClose={() => setError("")} />

          {!isEditMode && (
            <>
              <div className="space-y-0.5">
                <label className="block text-base font-semibold text-gray-700">
                  User ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  readOnly
                  className={readOnlyInputClassName}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-0.5">
                  <label className="block text-base font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className={readOnlyInputClassName}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="block text-base font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.givenName}
                    readOnly
                    className={readOnlyInputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-0.5">
                  <label className="block text-base font-semibold text-gray-700">
                    Middle Name
                  </label>
                  <label className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                    <input
                      type="text"
                      value={formData.middleName}
                      readOnly
                      className="grow bg-transparent outline-none"
                    />
                    <span className="badge badge-neutral badge-xs shrink-0">
                      Optional
                    </span>
                  </label>
                </div>

                <div className="space-y-0.5">
                  <label className="block text-base font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    readOnly
                    className={readOnlyInputClassName}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-0.5">
            <label className="block text-base font-semibold text-gray-700">
              Role {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            {isViewMode ? (
              <div className="w-full min-h-24 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {displayedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {displayedRoles.map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No content</span>
                )}
              </div>
            ) : (
              <MultiSelect
                options={availableRoles}
                selectedValues={selectedRoleIds}
                onChange={handleRoleChange}
                placeholder="Select roles"
              />
            )}
          </div>

          <div className="space-y-0.5">
            <label className="block text-base font-semibold text-gray-700">
              Status {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              disabled={isViewMode}
              className={`select w-full rounded-lg ${
                isViewMode
                  ? "border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
                  : "border border-gray-200 bg-white text-gray-700"
              }`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
              onClick={onClose}
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                form="user-pool-form"
                type="submit"
                className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
