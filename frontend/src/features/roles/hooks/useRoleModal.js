import { useState, useEffect, useMemo } from "react";

export const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const normalizeTextValue = (value) =>
  typeof value === "string" ? value : "";

export const normalizePermissionLabel = (permission) => {
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

export const normalizePermissionId = (permission) => {
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

export const normalizePermissionOption = (permission = {}) => {
  const id = normalizePermissionId(permission);
  const label = normalizePermissionLabel(permission);
  if (id === null || !label) {
    return null;
  }
  return { id, permission: label };
};

export const mapPermissionNamesToIds = (permissionNames = [], permissionOptions = []) => {
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

export function useRoleModal({
  open,
  mode,
  role,
  permissionOptions = [],
  onSubmit,
  onClose,
}) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const isRoleNameEditable = isCreateMode;
  const shouldUseSteps = isCreateMode;

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

  const fieldErrors = useMemo(
    () => ({
      name: isRoleNameEditable && !roleName.trim() ? "Name is required." : "",
      description: !description.trim() ? "Description is required." : "",
    }),
    [description, isRoleNameEditable, roleName],
  );

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
    setActiveVoiceField(isRoleNameEditable ? "name" : "description");
    setError("");
    setTouched({
      name: false,
      description: false,
    });
  }, [isCreateMode, isRoleNameEditable, normalizedPermissionOptions, open, role]);

  const clearAlertError = () => {
    if (error) {
      setError("");
    }
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
    !isRoleNameEditable || activeVoiceField === "description"
      ? "Description"
      : "Name";

  const handleRoleNameChange = (value) => {
    if (!isRoleNameEditable) return;
    setRoleName(normalizeTextValue(value));
    clearAlertError();
  };

  const handleDescriptionChange = (value) => {
    setDescription(normalizeTextValue(value));
    clearAlertError();
  };

  const handleSpeechTranscript = (transcript) => {
    if (!isRoleNameEditable || activeVoiceField === "description") {
      handleDescriptionChange(
        description.trim()
          ? `${description.trimEnd()} ${transcript}`
          : transcript,
      );
      return;
    }
    handleRoleNameChange(transcript);
  };

  const togglePermission = (permissionId) => {
    if (isViewMode) return;
    setSelectedPermissionIds((currentIds) =>
      currentIds.includes(permissionId)
        ? currentIds.filter((currentId) => currentId !== permissionId)
        : [...currentIds, permissionId],
    );
    clearAlertError();
  };

  const goToPermissionsStep = () => {
    setTouched({ name: true, description: true });
    if (!validateForm()) return;
    setError("");
    setStep(2);
  };

  const handleNextClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    goToPermissionsStep();
  };

  const goToDetailsStep = () => {
    setError("");
    setStep(1);
  };

  const handleDialogSubmit = (event) => {
    event.preventDefault();
    if (isViewMode) {
      onClose();
      return;
    }

    if (isCreateMode && step === 1) {
      goToPermissionsStep();
      return;
    }

    setTouched({ name: true, description: true });
    if (!validateForm()) {
      setStep(1);
      return;
    }

    const submittedRoleName = isRoleNameEditable
      ? roleName.trim()
      : normalizeTextValue(role?.role_name).trim();

    onSubmit({
      id: role?.id,
      role_name: submittedRoleName,
      description: description.trim(),
      permission_ids: selectedPermissionIds,
    });
  };

  const showRoleDetails = !shouldUseSteps || step === 1;
  const showPermissions = !shouldUseSteps || step === 2;

  return {
    isCreateMode,
    isEditMode,
    isViewMode,
    isRoleNameEditable,
    shouldUseSteps,
    modalTitle,
    roleName,
    description,
    selectedPermissionIds,
    step,
    activeVoiceField,
    setActiveVoiceField,
    error,
    setError,
    touched,
    fieldErrors,
    mergedPermissionOptions,
    activeVoiceFieldLabel,
    handleRoleNameChange,
    handleDescriptionChange,
    handleSpeechTranscript,
    togglePermission,
    handleNextClick,
    goToDetailsStep,
    handleDialogSubmit,
    showRoleDetails,
    showPermissions,
  };
}
