import { Fragment } from "react";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
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
import { HelpCircle } from "lucide-react";
import RoleStepIndicator from "./RoleStepIndicator";
import { useRoleModal } from "../hooks/useRoleModal";
import { PERMISSION_GROUPS } from "../utils/roleConstants";

export default function RoleModal({ open, mode, role, permissionOptions = [], isPermissionOptionsLoading = false, onClose, onSubmit, colorMode = "light" }) {
  const modalState = useRoleModal({
    open,
    mode,
    role,
    permissionOptions,
    onSubmit,
    onClose,
  });

  const {
    isCreateMode,
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
  } = modalState;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName={!isCreateMode ? "text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" : undefined}>
        <DialogHeader className={!isCreateMode ? "-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground" : undefined}>
          <DialogTitle>{modalTitle}</DialogTitle>
          {isCreateMode && (
            <DialogDescription>
              Manage the role details and permissions.
            </DialogDescription>
          )}
        </DialogHeader>

        <form id="role-form" noValidate onSubmit={handleDialogSubmit} className="space-y-6 -mx-4 no-scrollbar max-h-[60vh] px-4 overflow-y-auto pt-3 pb-2">
          {shouldUseSteps && (
            <div className="w-full">
              <RoleStepIndicator currentStep={step} colorMode={colorMode} />
            </div>
          )}

          {isViewMode ? (
            <div className="space-y-6 pt-3 pb-4 px-2">
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
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-5">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Role Details</h4>
                      <p className="text-sm text-muted-foreground">Enter the description.</p>
                    </div>
                    <Separator />
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
                              onFocus={() => setActiveVoiceField("name")}
                              placeholder="(e.g., admin)"
                              autoCapitalize="none"
                              spellCheck={false}
                              className="h-10 rounded-lg"
                            />
                            {touched.name && fieldErrors.name && (
                              <p className="!mt-0 text-xs text-destructive">{fieldErrors.name}</p>
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
                          onFocus={() => setActiveVoiceField("description")}
                          rows={4}
                          placeholder="Type role description here…"
                          className="rounded-lg"
                        />
                        {touched.description && fieldErrors.description && (
                          <p className="!mt-0 text-xs text-destructive">{fieldErrors.description}</p>
                        )}
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showPermissions && (
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-6">
                    {isPermissionOptionsLoading && mergedPermissionOptions.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">Loading permissions...</div>
                    ) : mergedPermissionOptions.length > 0 ? (
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-sm uppercase">Permissions</h4>
                          <p className="text-sm text-muted-foreground">Select the permissions assigned to this role.</p>
                        </div>
                        <Separator />
                        <div className="space-y-6 mt-4">
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
                                                className="data-checked:!bg-[#7b0d15] data-checked:!border-[#7b0d15] data-checked:!text-white dark:data-checked:!bg-[#f8d24e] dark:data-checked:!border-[#f8d24e] dark:data-checked:!text-[#7b0d15]"
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
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </form>

        <DialogFooter className="flex-row items-center justify-between gap-2">
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
                <Button type="button" onClick={handleNextClick} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
                  Next
                </Button>
              ) : (
                <Button form="role-form" type="submit" className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
                  Create
                </Button>
              )}
            </>
          ) : (
            <div className="flex gap-2 ml-auto justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {isViewMode ? "Close" : "Cancel"}
              </Button>
              {!isViewMode && (
                <Button
                  form="role-form"
                  type="submit"
                  className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200"
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
