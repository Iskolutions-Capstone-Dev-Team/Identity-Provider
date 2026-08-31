import { Fragment } from "react";
import { motion } from "framer-motion";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stepper, StepperIndicator, StepperItem, StepperNav, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";
import { PERMISSION_GROUPS } from "../utils/roleConstants";
import { useRoleCreateForm } from "../hooks/useRoleCreateForm";

const steps = [
  { title: "Role Details" },
  { title: "Permissions" },
];

export default function RoleCreateForm({ permissionOptions = [], isPermissionOptionsLoading = false, onClose, onSubmit, colorMode = "light" }) {
  const formState = useRoleCreateForm({
    permissionOptions,
    onSubmit,
  });

  const {
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
  } = formState;

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
                    <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-white dark:data-[state=completed]:bg-[#ffd21a] dark:data-[state=completed]:text-black data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-white dark:data-[state=active]:bg-[#ffd21a] dark:data-[state=active]:border-[#ffd21a] dark:data-[state=active]:text-black">{index + 1}</StepperIndicator>
                    <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                  </StepperTrigger>
                  {index < steps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15] dark:data-[state=completed]:bg-[#ffd21a]" />}
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
        <motion.div
          key="role-step-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-3 pb-0 w-full">
              <div className="space-y-1">
                <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                  ROLE DETAILS
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground m-0">
                  Enter the role's basic details.
                </CardDescription>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Field className="w-full">
                  <FieldLabel htmlFor="role-name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input id="role-name" type="text" required value={roleName} onChange={(event) => handleRoleNameChange(event.target.value)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., admin)" autoCapitalize="none" spellCheck={false} className="h-10 rounded-lg"/>
                  {touched.name && fieldErrors.name && (
                    <p className="!mt-0 text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </Field>
              </div>

              <div>
                <Field className="w-full">
                  <FieldLabel htmlFor="role-description">
                    Description <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea id="role-description" required value={description} onChange={(event) => handleDescriptionChange(event.target.value)} onFocus={() => setActiveVoiceField("description")} rows={4} placeholder="Type role description here…" className="rounded-lg"/>
                  {touched.description && fieldErrors.description && (
                    <p className="!mt-0 text-xs text-destructive">{fieldErrors.description}</p>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showPermissions && (
        <motion.div
          key="role-step-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-3 pb-0 w-full">
              <div className="space-y-1">
                <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                  PERMISSIONS
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground m-0">
                  Assign permissions for this role.
                </CardDescription>
              </div>
              <Separator />
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
                                      <Checkbox checked={isSelected} onCheckedChange={() => togglePermission(permission.id)} className="data-checked:!bg-[#7b0d15] data-checked:!border-[#7b0d15] data-checked:!text-white dark:data-checked:!bg-[#f8d24e] dark:data-checked:!border-[#f8d24e] dark:data-checked:!text-[#7b0d15]" />
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
        </motion.div>
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
        <Button type="button" onClick={handleNextClick} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white dark:bg-[#ffd21a] dark:text-black hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-white transition-colors">
          Next
        </Button>
      ) : (
        <Button form="role-form" type="submit" className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white dark:bg-[#ffd21a] dark:text-black hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-white transition-colors">
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
