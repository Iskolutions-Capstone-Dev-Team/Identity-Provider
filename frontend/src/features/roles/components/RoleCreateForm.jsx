import { Fragment, useMemo, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { RoleShieldIcon, RoleDetailsIcon } from "./roleIcons";
import { User, Settings, Monitor, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperNav, StepperPanel, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";

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

const steps = [
  { title: "Role Details" },
  { title: "Permissions" },
];

export default function RoleCreateForm({ permissionOptions = [], isPermissionOptionsLoading = false, onClose, onSubmit, colorMode = "light" }) {
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
      name: !roleName.trim() ? "Role name is required." : "",
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

  const formContent = (
    <div className="space-y-6">
      {shouldUseSteps && (
        <Card className="w-full bg-card border-border shadow-sm p-6 mb-6">
          <Stepper
            value={step}
            onValueChange={setStep}
            orientation="horizontal"
            className="w-full max-w-3xl mx-auto"
          >
            <StepperNav>
              {steps.map((s, index) => (
                <StepperItem key={index} step={index + 1} className="flex flex-col items-center flex-1 relative">
                  <StepperTrigger className="relative z-10 flex flex-col gap-2.5 items-center w-full" onClick={() => { if(index + 1 < step) setStep(index + 1) }}>
                    <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-white data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-white">{index + 1}</StepperIndicator>
                    <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                  </StepperTrigger>
                  {index < steps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15]" />}
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
        </Card>
      )}

      {(!shouldUseSteps || step === 1) && (
        <SpeechInputToolbar
          activeFieldLabel={activeVoiceFieldLabel}
          onError={setError}
          onTranscript={handleSpeechTranscript}
          colorMode={colorMode}
        />
      )}

      {showRoleDetails && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-0 pb-0 w-full">
              <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                ROLE DETAILS
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground m-0">
                Enter the role's basic details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Field className="w-full">
                  <FieldLabel htmlFor="role-name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input id="role-name" type="text" required value={roleName} onChange={(event) => handleRoleNameChange(event.target.value)} onBlur={() => setFieldTouched("name")} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., admin)" autoCapitalize="none" className="h-10 rounded-lg"/>
                  {touched.name && fieldErrors.name && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </Field>
              </div>

              <div>
                <Field className="w-full">
                  <FieldLabel htmlFor="role-description">
                    Description <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea id="role-description" required value={description} onChange={(event) => handleDescriptionChange(event.target.value)} onBlur={() => setFieldTouched("description")} onFocus={() => setActiveVoiceField("description")} rows={4} placeholder="Type role description here…" className="rounded-lg"/>
                  {touched.description && fieldErrors.description && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPermissions && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-0 pb-0 w-full">
              <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                PERMISSIONS
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground m-0">
                Assign permissions for this role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isPermissionOptionsLoading && mergedPermissionOptions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">Loading permissions...</div>
              ) : mergedPermissionOptions.length > 0 ? (
                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPermissions = mergedPermissionOptions.filter((p) =>
                      group.permissions.some((gp) => gp.toLowerCase() === p.permission.toLowerCase())
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
                                    <FieldLabel className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                      <Checkbox checked={isSelected} onCheckedChange={() => togglePermission(permission.id)}/>
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
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground italic">No permissions available</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const footerActions = (
    <div className="flex flex-col-reverse gap-3 mt-4 md:mb-12 lg:flex-row lg:justify-end xl:mb-16 [&>button]:w-full lg:[&>button]:w-auto">
      {step === 1 ? (
        <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-lg px-6">
          Cancel
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={goToDetailsStep} className="h-10 rounded-lg px-6">
          Back
        </Button>
      )}

      {step === 1 ? (
        <Button type="button" onClick={handleNextClick} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors">
          Next
        </Button>
      ) : (
        <Button form="role-form" type="submit" className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors">
          Create Role
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <form id="role-form" noValidate className="space-y-5" onSubmit={handleSubmit}>
        {formContent}
      </form>
      {footerActions}
    </div>
  );
}
