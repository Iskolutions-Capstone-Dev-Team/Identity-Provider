import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { getModalTheme } from "../modalTheme";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeTextValue = (value) =>
  typeof value === "string" ? value : "";

const normalizePermissionLabel = (permission) => {
  if (typeof permission === "string") {
    return permission.trim();
  }

  if (!permission || typeof permission !== "object") {
    return "";
  }

  const label =
    permission.permission ??
    permission.permission_name ??
    permission.name ??
    permission.PermissionName;

  return typeof label === "string" ? label.trim() : "";
};

const normalizePermissionId = (permission) => {
  if (permission && typeof permission === "object") {
    return toPositiveInt(
      permission.id ??
      permission.permission_id ??
      permission.permissionId ??
      permission.ID,
    );
  }

  return toPositiveInt(permission);
};

const normalizePermissionOption = (permission = {}) => {
  const id = normalizePermissionId(permission);
  const label = normalizePermissionLabel(permission);

  if (id === null || !label) {
    return null;
  }

  return {
    id,
    permission: label,
  };
};

const mapPermissionNamesToIds = (permissionNames = [], permissionOptions = []) => {
  if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
    return [];
  }

  const permissionMap = new Map(
    permissionOptions.map((permission) => [
      permission.permission.toLowerCase(),
      permission.id,
    ]),
  );

  return Array.from(
    new Set(
      permissionNames
        .map((permissionName) =>
          permissionMap.get(permissionName.toLowerCase()),
        )
        .filter((permissionId) => permissionId !== undefined),
    ),
  );
};

function getPermissionCardClassName({ isSelected, isViewMode, isDarkMode }) {
  return `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
    isSelected
      ? isDarkMode
        ? "border-[#f8d24e]/35 bg-[#f8d24e]/12 text-[#ffe28a]"
        : "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
      : isDarkMode
        ? "border-white/10 bg-white/[0.04] text-[#d6c3c7]"
        : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41]"
  } ${
    isViewMode
      ? "cursor-default"
      : isDarkMode
        ? "hover:border-[#f8d24e]/35 hover:bg-[#f8d24e]/10"
        : "hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"
  }`;
}

export default function RoleModal({ open, mode, role, permissionOptions = [], isPermissionOptionsLoading = false, onClose, onSubmit, colorMode = "light" }) {
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
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
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
  } = getModalTheme(colorMode);

  const modalTitle =
    mode === "create" ? "Create Role" : mode === "edit" ? "Edit Role" : "View Role";
  const modalDescription =
    mode === "create"
      ? "Define a new role and assign its permissions."
      : mode === "edit"
        ? "Modify the role's name, description, and permissions."
        : "View the role's saved details and permissions.";

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    description: false,
  });

  const normalizedPermissionOptions = useMemo(
    () =>
      permissionOptions
        .map((permission) => normalizePermissionOption(permission))
        .filter(Boolean),
    [permissionOptions],
  );
  const mergedPermissionOptions = useMemo(() => {
    const optionMap = new Map(
      normalizedPermissionOptions.map((permission) => [permission.id, permission]),
    );

    selectedPermissionIds.forEach((permissionId) => {
      if (!optionMap.has(permissionId)) {
        optionMap.set(permissionId, {
          id: permissionId,
          permission: `Permission #${permissionId}`,
        });
      }
    });

    return Array.from(optionMap.values());
  }, [normalizedPermissionOptions, selectedPermissionIds]);

  const readOnlyTextAreaClassName =
    `${modalReadOnlyInputClassName} min-h-28 whitespace-pre-wrap`;
  const editableFieldBaseClassName = isDarkMode
    ? "w-full rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] px-4 text-sm text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-[background-color,border-color,color,box-shadow] duration-500 ease-out placeholder:text-[#9f8790] focus:border-[#f8d24e]/55"
    : "w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 text-sm text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition-[background-color,border-color,color,box-shadow] duration-500 ease-out placeholder:text-[#9b7d84] focus:border-[#d4a017]";
  const editableInputBaseClassName = `${editableFieldBaseClassName} h-14`;
  const editableTextAreaBaseClassName =
    `${editableFieldBaseClassName} min-h-28 resize-none py-3`;
  const emptyContentClassName = isDarkMode
    ? "italic text-[#a58d95]"
    : "italic text-[#8f6f76]";
  const permissionCheckboxClassName = isDarkMode
    ? "checkbox h-5 w-5 rounded border-white/20 bg-transparent checked:border-[#f8d24e] checked:bg-[#7b0d15] checked:text-white"
    : "checkbox h-5 w-5 rounded border-[#7b0d15]/20 bg-transparent checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white";

  const fieldErrors = useMemo(
    () => ({
      name: !roleName.trim() ? "Role name is required." : "",
      description: !description.trim() ? "Description is required." : "",
    }),
    [description, roleName],
  );

  const getEditableInputClassName = (hasError) =>
    `${editableInputBaseClassName} ${
      hasError ? "border-red-400 focus:border-red-500" : ""
    }`;

  const getEditableTextAreaClassName = (hasError) =>
    `${editableTextAreaBaseClassName} ${
      hasError ? "border-red-400 focus:border-red-500" : ""
    }`;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isCreateMode) {
      setRoleName("");
      setDescription("");
      setSelectedPermissionIds([]);
    } else {
      const rolePermissionIds = Array.isArray(role?.permissionIds)
        ? role.permissionIds
        : [];
      const rolePermissionLabels = Array.isArray(role?.permissionLabels)
        ? role.permissionLabels
        : [];

      setRoleName(normalizeTextValue(role?.role_name));
      setDescription(normalizeTextValue(role?.description));
      setSelectedPermissionIds(
        rolePermissionIds.length > 0
          ? rolePermissionIds
          : mapPermissionNamesToIds(
              rolePermissionLabels,
              normalizedPermissionOptions,
            ),
      );
    }

    setActiveVoiceField("name");
    setError("");
    setTouched({
      name: false,
      description: false,
    });
  }, [isCreateMode, normalizedPermissionOptions, open, role]);

  const clearAlertError = () => {
    if (error) {
      setError("");
    }
  };

  const setFieldTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const validateForm = () => {
    const firstError = fieldErrors.name || fieldErrors.description;

    if (!firstError) {
      setError("");
      return true;
    }

    setError(firstError);
    return false;
  };

  const activeVoiceFieldLabel =
    activeVoiceField === "description" ? "Role Description" : "Role Name";

  const handleRoleNameChange = (value) => {
    setRoleName(normalizeTextValue(value));
    clearAlertError();
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    clearAlertError();
  };

  const togglePermission = (permissionId) => {
    if (isViewMode) {
      return;
    }

    setSelectedPermissionIds((currentIds) =>
      currentIds.includes(permissionId)
        ? currentIds.filter((currentId) => currentId !== permissionId)
        : [...currentIds, permissionId],
    );
    clearAlertError();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    setTouched({
      name: true,
      description: true,
    });

    if (!validateForm()) {
      return;
    }

    onSubmit({
      id: role?.id,
      role_name: roleName.trim(),
      description: description.trim(),
      permission_ids: selectedPermissionIds,
    });
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={`${modalHeaderClassName} !pb-6 sm:!pb-7`}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>{modalTitle}</h3>
              <p className={modalHeaderDescriptionClassName}>{modalDescription}</p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form id="role-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <ErrorAlert message={error} onClose={() => setError("")} />

            {!isViewMode && (
              <SpeechInputToolbar
                activeFieldLabel={activeVoiceFieldLabel}
                onError={setError}
                onTranscript={(transcript) => {
                  if (activeVoiceField === "description") {
                    handleDescriptionChange(
                      description.trim()
                        ? `${description.trimEnd()} ${transcript}`
                        : transcript,
                    );
                    return;
                  }

                  handleRoleNameChange(transcript);
                }}
                colorMode={colorMode}
              />
            )}

            <section className={modalSectionClassName}>
              <div className="space-y-5">
                <div>
                  <label className={modalLabelClassName}>
                    Role Name {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  {!isViewMode && (
                    <p className={modalHelperTextClassName}>
                      Enter the role name exactly as it should be saved.
                    </p>
                  )}

                  {isViewMode ? (
                    <div className={modalReadOnlyInputClassName}>
                      {roleName.trim() ? (
                        <span className="truncate">{roleName}</span>
                      ) : (
                        <span className={emptyContentClassName}>No content</span>
                      )}
                    </div>
                  ) : (
                    <input type="text" required value={roleName} onChange={(event) => handleRoleNameChange(event.target.value)} onBlur={() => setFieldTouched("name")} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., system:admin)" autoCapitalize="none"
                      className={getEditableInputClassName(
                        touched.name && Boolean(fieldErrors.name),
                      )}
                    />
                  )}

                  {!isViewMode && touched.name && fieldErrors.name && (
                    <p className="mt-2 text-xs text-red-500">{fieldErrors.name}</p>
                  )}
                </div>
              </div>
            </section>

            <section className={modalSectionClassName}>
              <div>
                <label className={modalLabelClassName}>
                  Role Description {!isViewMode && <span className="text-red-500">*</span>}
                </label>

                {isViewMode ? (
                  <div className={readOnlyTextAreaClassName}>
                    {description.trim() ? (
                      description
                    ) : (
                      <span className={emptyContentClassName}>No content</span>
                    )}
                  </div>
                ) : (
                  <>
                    <textarea required value={description} onChange={(event) => handleDescriptionChange(event.target.value)} onBlur={() => setFieldTouched("description")} onFocus={() => setActiveVoiceField("description")} rows="4" placeholder="Role description"
                      className={getEditableTextAreaClassName(
                        touched.description && Boolean(fieldErrors.description),
                      )}
                    />
                    {touched.description && fieldErrors.description && (
                      <p className="mt-2 text-xs text-red-500">
                        {fieldErrors.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className={modalSectionClassName}>
              <div className="space-y-5">
                <div>
                  <label className={modalLabelClassName}>Permissions</label>

                  {!isViewMode && (
                    <p className={modalHelperTextClassName}>
                      Select the permissions assigned to this role.
                    </p>
                  )}

                  {isPermissionOptionsLoading && mergedPermissionOptions.length === 0 ? (
                    <p className={modalHelperTextClassName}>Loading permissions...</p>
                  ) : mergedPermissionOptions.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {mergedPermissionOptions.map((permission) => {
                        const isSelected = selectedPermissionIds.includes(permission.id);

                        return (
                          <label key={permission.id}
                            className={getPermissionCardClassName({
                              isSelected,
                              isViewMode,
                              isDarkMode,
                            })}
                          >
                            <input type="checkbox" className={permissionCheckboxClassName} checked={isSelected} onChange={() => togglePermission(permission.id)} disabled={isViewMode} />
                            <span className="break-words">{permission.permission}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={modalReadOnlyInputClassName}>
                      <span className={emptyContentClassName}>No permissions available</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {isViewMode && (
              <section className={modalSectionClassName}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={modalLabelClassName}>Created At</label>
                    <div className={modalReadOnlyInputClassName}>
                      {role?.created_at ? (
                        <span className="truncate">{role.created_at}</span>
                      ) : (
                        <span className={emptyContentClassName}>No content</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={modalLabelClassName}>Updated At</label>
                    <div className={modalReadOnlyInputClassName}>
                      {role?.updated_at ? (
                        <span className="truncate">{role.updated_at}</span>
                      ) : (
                        <span className={emptyContentClassName}>No content</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button form="role-form" type="submit" className={modalPrimaryButtonClassName}>
                {mode === "create" ? "Create" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}