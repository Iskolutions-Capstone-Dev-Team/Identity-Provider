import { Fragment, useEffect, useMemo, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { RoleShieldIcon, RoleDetailsIcon } from "./roleIcons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, Settings, HelpCircle, Lock, Monitor, FileText } from "lucide-react";

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
  return { id, permission: label };
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

const PERMISSION_GROUPS = [
  {
    value: "userpool",
    trigger: "Userpool",
    icon: <User className="text-muted-foreground size-4" />,
    permissions: [
      "Activate user", "Add user", "Assign appclient to user", "Assign Roles", 
      "Delete User", "Edit User", "View All Users", "View Users based on Appclient", 
      "Remove appclient from user", "Remove Roles", "Suspend user"
    ]
  },
  {
    value: "role",
    trigger: "Role",
    icon: <RoleShieldIcon className="text-muted-foreground size-4" />,
    permissions: [
      "Add roles", "Delete Roles", "Edit Roles", "View roles"
    ]
  },
  {
    value: "appclient",
    trigger: "AppClient",
    icon: <Monitor className="text-muted-foreground size-4" />,
    permissions: [
      "Add appclient", "Delete appclient", "Edit appclient", "View all appclients", "View Connected Appclients"
    ]
  },
  {
    value: "auditlogs",
    trigger: "Audit Logs",
    icon: <FileText className="text-muted-foreground size-4" />,
    permissions: [
      "View Audit Logs", "View Security Logs"
    ]
  },
  {
    value: "registrationconfig",
    trigger: "Registration Config",
    icon: <Settings className="text-muted-foreground size-4" />,
    permissions: [
      "Create Registration Config", "Edit Registration Config", "View Registration Config", "Delete Registration Config"
    ]
  }
];

function RoleStepIndicator({ currentStep, colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const activeStepClassName = "border-primary bg-primary/10 text-primary";
  const inactiveStepClassName = "border-border bg-muted/50 text-muted-foreground";
  const activeLabelClassName = "text-primary";
  const inactiveLabelClassName = "text-muted-foreground";
  const lineClassName = currentStep >= 2 ? "border-primary/50" : "border-border";

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
      name: isRoleNameEditable && !roleName.trim() ? "Role name is required." : "",
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName={!isCreateMode ? "text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" : undefined}>
        <DialogHeader className={!isCreateMode ? "-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground" : undefined}>
          <DialogTitle>{modalTitle}</DialogTitle>
          {isCreateMode && (
            <DialogDescription>
              Manage the role details and permissions.
            </DialogDescription>
          )}
        </DialogHeader>

        <form id="role-form" noValidate onSubmit={handleDialogSubmit} className="space-y-6 -mx-4 no-scrollbar max-h-[60vh] px-4 overflow-y-auto pb-2">
          {shouldUseSteps && (
            <div className="w-full">
              <RoleStepIndicator currentStep={step} colorMode={colorMode} />
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError("")} />

          {isViewMode ? (
            <div className="space-y-6 pt-4 pb-4 px-2">
              <Card className="bg-muted/30 border-border/40 shadow-sm">
                <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {roleName}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <p className="text-sm text-muted-foreground">
                        {description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:text-right">
                    <p className="text-sm text-muted-foreground font-mono">
                      Created: {role?.created_at || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Updated: {role?.updated_at || "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Permissions</h4>
                <Frame stacked spacing="sm">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPermissions = mergedPermissionOptions.filter(
                      (p) => selectedPermissionIds.includes(p.id) && group.permissions.some(gp => gp.toLowerCase() === p.permission.toLowerCase())
                    );
                    if (groupPermissions.length === 0) return null;
                    
                    return (
                      <FramePanel key={group.value}>
                        <Accordion type="multiple" className="border-none">
                          <AccordionItem value={group.value} className="border-none bg-transparent **:data-[slot=accordion-content]:p-0!">
                            <AccordionTrigger className="items-center px-1 py-1 font-semibold hover:no-underline">
                              <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-lg flex h-8 w-8 items-center justify-center">
                                  {group.icon}
                                </div>
                                <span>{group.trigger}</span>
                                <Badge variant="outline" className="ms-1 bg-muted/50 text-muted-foreground border-transparent">
                                  {groupPermissions.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground p-0 ps-1!">
                              <div className="pl-12 pr-2 pb-3 flex flex-wrap gap-2 pt-2">
                                {groupPermissions.map((permission, idx) => (
                                  <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>
                                    {permission.permission}
                                  </Badge>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </FramePanel>
                    );
                  })}
                  {/* Handling Uncategorized permissions */}
                  {(() => {
                    const categorizedPermissions = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.toLowerCase()));
                    const otherPermissions = mergedPermissionOptions.filter(
                      (p) => selectedPermissionIds.includes(p.id) && !categorizedPermissions.includes(p.permission.toLowerCase())
                    );
                    
                    if (otherPermissions.length === 0) return null;
                    return (
                      <FramePanel key="other">
                        <Accordion type="multiple" className="border-none">
                          <AccordionItem value="other" className="border-none bg-transparent **:data-[slot=accordion-content]:p-0!">
                            <AccordionTrigger className="items-center px-1 py-1 font-semibold hover:no-underline">
                              <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-lg flex h-8 w-8 items-center justify-center">
                                  <HelpCircle className="text-muted-foreground size-4" />
                                </div>
                                <span>Other</span>
                                <Badge variant="outline" className="ms-1 bg-muted/50 text-muted-foreground border-transparent">
                                  {otherPermissions.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground p-0 ps-1!">
                              <div className="pl-12 pr-2 pb-3 flex flex-wrap gap-2 pt-2">
                                {otherPermissions.map((permission, idx) => (
                                  <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>
                                    {permission.permission}
                                  </Badge>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </FramePanel>
                    );
                  })()}
                  
                  {selectedPermissionIds.length === 0 && (
                    <Card className="min-h-[4rem] border-border/40 bg-muted/30">
                      <CardContent className="px-3 py-2 flex items-center justify-center h-full">
                        <span className="text-sm text-muted-foreground mt-4">
                          No permissions assigned
                        </span>
                      </CardContent>
                    </Card>
                  )}
                </Frame>
              </div>
            </div>
          ) : (
            <>
              {(!shouldUseSteps || step === 1) && (
                <SpeechInputToolbar
                  activeFieldLabel={activeVoiceFieldLabel}
                  onError={setError}
                  onTranscript={handleSpeechTranscript}
                  colorMode={colorMode}
                />
              )}

              {showRoleDetails && (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <Field className="w-full">
                      <FieldLabel htmlFor="role-name">
                        Name {isRoleNameEditable && <span className="text-destructive">*</span>}
                      </FieldLabel>
                      {isRoleNameEditable ? (
                        <>
                          <Input
                            id="role-name"
                            type="text"
                            required
                            value={roleName}
                            onChange={(event) => handleRoleNameChange(event.target.value)}
                            onBlur={() => setFieldTouched("name")}
                            onFocus={() => setActiveVoiceField("name")}
                            placeholder="(e.g., admin)"
                            autoCapitalize="none"
                            className="h-10 rounded-lg"
                          />
                          {touched.name && fieldErrors.name && (
                            <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                          )}
                        </>
                      ) : (
                        <Input id="role-name" disabled value={roleName} className="h-10 rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed border-input opacity-70 hover:opacity-70" />
                      )}
                    </Field>
                  </div>

                  <div>
                    <Field className="w-full">
                      <FieldLabel htmlFor="role-description">
                        Description <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        id="role-description"
                        required
                        value={description}
                        onChange={(event) => handleDescriptionChange(event.target.value)}
                        onBlur={() => setFieldTouched("description")}
                        onFocus={() => setActiveVoiceField("description")}
                        rows={4}
                        placeholder="Type role description here…"
                        className="rounded-lg"
                      />
                      {touched.description && fieldErrors.description && (
                        <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
                      )}
                    </Field>
                  </div>
                </div>
              )}

              {showPermissions && (
                <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
                  {isPermissionOptionsLoading && mergedPermissionOptions.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading permissions...</div>
                  ) : mergedPermissionOptions.length > 0 ? (
                    <div className="space-y-2">
                      <FieldLabel className="text-sm font-medium">Permissions</FieldLabel>
                      <div className="space-y-6">
                        {PERMISSION_GROUPS.map((group, groupIdx) => {
                          const groupPermissions = mergedPermissionOptions.filter((p) =>
                            group.permissions.some(gp => gp.toLowerCase() === p.permission.toLowerCase())
                          );
                        if (groupPermissions.length === 0) return null;
                        
                        return (
                          <Frame key={group.value} className="w-full" spacing="sm">
                            <FrameHeader>
                              <FrameTitle>{group.trigger}</FrameTitle>
                            </FrameHeader>
                            <FramePanel className="overflow-hidden p-0">
                              <FieldGroup className="gap-0">
                                {groupPermissions.map((permission, index) => {
                                  const isSelected = selectedPermissionIds.includes(permission.id);
                                  return (
                                    <Fragment key={permission.id}>
                                      <Field>
                                        <FieldLabel className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                          />
                                          <FieldTitle className="ml-2 leading-none font-medium text-sm">
                                            {permission.permission}
                                          </FieldTitle>
                                        </FieldLabel>
                                      </Field>
                                      {index < groupPermissions.length - 1 && <Separator />}
                                    </Fragment>
                                  );
                                })}
                              </FieldGroup>
                            </FramePanel>
                          </Frame>
                        );
                      })}
                      
                      {/* Handling Uncategorized permissions */}
                      {(() => {
                        const categorizedPermissions = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.toLowerCase()));
                        const otherPermissions = mergedPermissionOptions.filter(
                          (p) => !categorizedPermissions.includes(p.permission.toLowerCase())
                        );
                        
                        if (otherPermissions.length === 0) return null;
                        return (
                          <Frame key="other" className="w-full" spacing="sm">
                            <FrameHeader>
                              <FrameTitle>Other</FrameTitle>
                            </FrameHeader>
                            <FramePanel className="overflow-hidden p-0">
                              <FieldGroup className="gap-0">
                                {otherPermissions.map((permission, index) => {
                                  const isSelected = selectedPermissionIds.includes(permission.id);
                                  return (
                                    <Fragment key={permission.id}>
                                      <Field>
                                        <FieldLabel className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                          />
                                          <FieldTitle className="ml-2 leading-none font-medium text-sm">
                                            {permission.permission}
                                          </FieldTitle>
                                        </FieldLabel>
                                      </Field>
                                      {index < otherPermissions.length - 1 && <Separator />}
                                    </Fragment>
                                  );
                                })}
                              </FieldGroup>
                            </FramePanel>
                          </Frame>
                        );
                      })()}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground italic">No permissions available</div>
                  )}
                </div>
              )}
            </>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          {isCreateMode ? (
            <>
              {step === 1 ? (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={goToDetailsStep}>
                  Back
                </Button>
              )}
              {step === 1 ? (
                <Button type="button" onClick={handleNextClick}>
                  Next
                </Button>
              ) : (
                <Button form="role-form" type="submit">
                  Create
                </Button>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {isViewMode ? "Close" : "Cancel"}
              </Button>
              {!isViewMode && (
                <Button 
                  form="role-form" 
                  type="submit"
                  className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200"
                >
                  Save
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
