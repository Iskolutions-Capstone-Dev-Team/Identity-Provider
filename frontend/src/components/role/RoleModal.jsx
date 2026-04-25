import { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import { SpeechInputToolbar } from "../SpeechInputButton";
import { getModalTheme } from "../modalTheme";
import { getModalTransitionClassName, useModalTransition } from "../modalTransition";

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

function RoleShieldIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function RoleDetailsIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function RoleStepIndicator({ currentStep, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const activeStepClassName = isDarkMode
    ? "border-[#f8d24e]/20 bg-[#f8d24e]/10 text-[#ffe28a]"
    : "border-[#7b0d15]/10 bg-[#f8eef0] text-[#7b0d15]";
  const inactiveStepClassName = isDarkMode
    ? "border-white/10 bg-white/[0.04] text-[#cbb8bd]"
    : "border-[#7b0d15]/10 bg-white/75 text-[#8f6f76]";
  const activeLabelClassName = isDarkMode ? "text-[#ffe28a]" : "text-[#7b0d15]";
  const inactiveLabelClassName = isDarkMode ? "text-[#cbb8bd]" : "text-[#8f6f76]";
  const lineClassName =
    currentStep >= 2
      ? isDarkMode
        ? "border-[#f8d24e]/45"
        : "border-[#7b0d15]/25"
      : isDarkMode
        ? "border-white/15"
        : "border-[#7b0d15]/15";
  const steps = [
    {
      label: "Role Details",
      shortLabel: "Details",
      icon: <RoleDetailsIcon className="h-4 w-4" />,
    },
    {
      label: "Permissions",
      shortLabel: "Permissions",
      icon: <RoleShieldIcon className="h-4 w-4" />,
    },
  ];

  const getStepIconClassName = (isActive) =>
    `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border transition-colors duration-300 ${
      isActive ? activeStepClassName : inactiveStepClassName
    }`;
  const getStepLabelClassName = (isActive) =>
    `text-center text-xs font-semibold leading-tight transition-colors duration-300 sm:text-sm ${
      isActive ? activeLabelClassName : inactiveLabelClassName
    }`;

  return (
    <div className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(5.75rem,auto)_1fr_minmax(5.75rem,auto)] items-start gap-2 px-3 py-4 sm:gap-3 sm:px-4">
      {steps.map((stepItem, index) => {
        const isActive = currentStep >= index + 1;

        return (
          <Fragment key={stepItem.label}>
            <div className="flex min-w-0 flex-col items-center gap-2">
              <span className={getStepIconClassName(isActive)}>
                {stepItem.icon}
              </span>
              <span className={getStepLabelClassName(isActive)}>
                <span className="sm:hidden">{stepItem.shortLabel}</span>
                <span className="hidden sm:inline">{stepItem.label}</span>
              </span>
            </div>

            {index === 0 && (
              <span className={`mt-5 h-px flex-1 border-t-2 border-dotted ${lineClassName}`} aria-hidden="true" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function RoleModal({ open, mode, role, permissionOptions = [], isPermissionOptionsLoading = false, onClose, onSubmit, colorMode = "light" }) {
  const { shouldRender, isClosing } = useModalTransition(open);
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
    modalHeaderTitleClassName,
    modalHelperTextClassName,
    modalLabelClassName,
    modalOverlayClassName,
    modalPrimaryButtonClassName,
    modalReadOnlyInputClassName,
    modalSecondaryButtonClassName,
    modalSectionClassName,
    modalStepsWrapClassName,
  } = getModalTheme(colorMode);

  const modalTitle =
    mode === "create" ? "Add Role" : mode === "edit" ? "Edit Role" : "View Role";

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [step, setStep] = useState(1);
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
  const rolePermissionFallbackMap = useMemo(() => {
    const rolePermissionIds = Array.isArray(role?.permissionIds)
      ? role.permissionIds
      : [];
    const rolePermissionLabels = Array.isArray(role?.permissionLabels)
      ? role.permissionLabels
      : [];
    const fallbackMap = new Map();

    rolePermissionIds.forEach((permissionId, index) => {
      const label = rolePermissionLabels[index];

      if (permissionId && typeof label === "string" && label.trim()) {
        fallbackMap.set(permissionId, label.trim());
      }
    });

    return fallbackMap;
  }, [role]);
  const mergedPermissionOptions = useMemo(() => {
    const optionMap = new Map(
      normalizedPermissionOptions.map((permission) => [permission.id, permission]),
    );

    selectedPermissionIds.forEach((permissionId) => {
      if (!optionMap.has(permissionId)) {
        optionMap.set(permissionId, {
          id: permissionId,
          permission:
            rolePermissionFallbackMap.get(permissionId) ||
            `Permission #${permissionId}`,
        });
      }
    });

    return Array.from(optionMap.values());
  }, [
    normalizedPermissionOptions,
    rolePermissionFallbackMap,
    selectedPermissionIds,
  ]);

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
  const modalHeaderSpacingClassName =
    `${modalHeaderClassName} h-[7rem] shrink-0 !px-7 !py-0 sm:!px-8`;
  const modalHeaderContentClassName =
    "flex min-w-0 flex-1 items-center gap-4 pr-3 sm:pr-16";
  const headerIconClassName =
    colorMode === "dark" ? "h-10 w-10 text-[#ffe28a]" : "h-10 w-10 text-[#fff0a8]";
  const sectionHeaderClassName = isDarkMode
    ? "mb-5 border-b border-white/10 pb-4"
    : "mb-5 border-b border-[#7b0d15]/10 pb-4";
  const sectionDescriptionClassName = `${modalHelperTextClassName} !mb-0`;

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

    setStep(1);
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

  const goToPermissionsStep = () => {
    if (!isViewMode) {
      setTouched({
        name: true,
        description: true,
      });

      if (!validateForm()) {
        return;
      }
    }

    setError("");
    setStep(2);
  };

  const goToDetailsStep = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (step === 1) {
      goToPermissionsStep();
      return;
    }

    setTouched({
      name: true,
      description: true,
    });

    if (!validateForm()) {
      setStep(1);
      return;
    }

    onSubmit({
      id: role?.id,
      role_name: roleName.trim(),
      description: description.trim(),
      permission_ids: selectedPermissionIds,
    });
  };

  if (!shouldRender) {
    return null;
  }

  const roleDetailsDescription = isViewMode
    ? "View the role name and description."
    : "Enter the role name and description.";
  const permissionsDescription = isViewMode
    ? "View the permissions assigned to this role."
    : "Select the permissions assigned to this role.";
  const renderSectionHeader = (title, description) => (
    <div className={sectionHeaderClassName}>
      <label className={modalLabelClassName}>
        {title}
      </label>
      <p className={sectionDescriptionClassName}>
        {description}
      </p>
    </div>
  );

  return createPortal(
    <dialog open className={getModalTransitionClassName(modalOverlayClassName, isClosing)}>
      <div className={modalBoxClassName}>
        <div className={modalHeaderSpacingClassName}>
          <div className="flex h-full items-center justify-between gap-4 sm:gap-6">
            <div className={modalHeaderContentClassName}>
              <RoleShieldIcon className={headerIconClassName} />
              <h3 className={modalHeaderTitleClassName}>{modalTitle}</h3>
            </div>

            <button type="button" className={`${modalCloseButtonClassName} shrink-0`} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form id="role-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <div className={modalStepsWrapClassName}>
              <RoleStepIndicator currentStep={step} colorMode={colorMode} />
            </div>

            <ErrorAlert message={error} onClose={() => setError("")} />

            {!isViewMode && step === 1 && (
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

            {step === 1 && (
              <>
                <section className={modalSectionClassName}>
                  {renderSectionHeader("Role Details", roleDetailsDescription)}
                  <div className="space-y-5">
                    <div>
                      <label className={modalLabelClassName}>
                        Role Name {!isViewMode && <span className="text-red-500">*</span>}
                      </label>

                      {isViewMode ? (
                        <div className={modalReadOnlyInputClassName}>
                          {roleName.trim() ? (
                            <span className="truncate">{roleName}</span>
                          ) : (
                            <span className={emptyContentClassName}>No content</span>
                          )}
                        </div>
                      ) : (
                        <input type="text" required value={roleName} onChange={(event) => handleRoleNameChange(event.target.value)} onBlur={() => setFieldTouched("name")} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., admin)" autoCapitalize="none"
                          className={getEditableInputClassName(
                            touched.name && Boolean(fieldErrors.name),
                          )}
                        />
                      )}

                      {!isViewMode && touched.name && fieldErrors.name && (
                        <p className="mt-2 text-xs text-red-500">{fieldErrors.name}</p>
                      )}
                    </div>

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
              </>
            )}

            {step === 2 && (
              <section className={modalSectionClassName}>
                <div className="space-y-5">
                  <div>
                    {renderSectionHeader("Permissions", permissionsDescription)}

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
            )}
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            {step === 1 ? (
              <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
                {isViewMode ? "Close" : "Cancel"}
              </button>
            ) : (
              <button type="button" className={modalSecondaryButtonClassName} onClick={goToDetailsStep}>
                Back
              </button>
            )}

            {step === 1 ? (
              <button type="button" className={modalPrimaryButtonClassName} onClick={goToPermissionsStep}>
                Next
              </button>
            ) : isViewMode ? (
              <button type="button" className={modalPrimaryButtonClassName} onClick={onClose}>
                Close
              </button>
            ) : (
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