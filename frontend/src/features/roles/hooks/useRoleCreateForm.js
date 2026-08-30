import { useState, useMemo } from "react";
import { normalizePermissionOption, normalizeTextValue } from "./useRoleModal";

export function useRoleCreateForm({
  permissionOptions = [],
  onSubmit,
}) {
  const shouldUseSteps = true;

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
  
  const mergedPermissionOptions = useMemo(() => {
    return normalizedPermissionOptions;
  }, [normalizedPermissionOptions]);

  const fieldErrors = useMemo(
    () => ({
      name: !roleName.trim() ? "Name is required." : "",
      description: !description.trim() ? "Description is required." : "",
    }),
    [description, roleName],
  );

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

  const activeVoiceFieldLabel = activeVoiceField === "description" ? "Role Description" : "Role Name";

  const handleRoleNameChange = (value) => {
    setRoleName(normalizeTextValue(value));
    clearAlertError();
  };

  const handleDescriptionChange = (value) => {
    setDescription(normalizeTextValue(value));
    clearAlertError();
  };

  const handleSpeechTranscript = (transcript) => {
    if (activeVoiceField === "description") {
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (step === 1) {
      goToPermissionsStep();
      return;
    }

    setTouched({ name: true, description: true });
    if (!validateForm()) {
      setStep(1);
      return;
    }

    onSubmit({
      role_name: roleName.trim(),
      description: description.trim(),
      permission_ids: selectedPermissionIds,
    });
  };

  const showRoleDetails = !shouldUseSteps || step === 1;
  const showPermissions = !shouldUseSteps || step === 2;

  return {
    shouldUseSteps,
    roleName,
    description,
    selectedPermissionIds,
    step,
    setStep,
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
    handleSubmit,
    showRoleDetails,
    showPermissions,
  };
}
