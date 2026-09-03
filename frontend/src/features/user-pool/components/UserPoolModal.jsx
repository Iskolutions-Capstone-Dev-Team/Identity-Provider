import UserPoolRoleRadioGroup from "./UserPoolRoleRadioGroup";
import UserPoolAuthAppMfaModal from "./UserPoolAuthAppMfaModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SUFFIX_OPTIONS } from "../../../utils/suffixOptions";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckIcon, User, Copy, CopyCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import AppClientComboboxField from "./AppClientComboboxField";
import { useUserPoolModal } from "../hooks/useUserPoolModal";

export default function UserPoolModal({
  open,
  mode,
  user,
  userType = "regular",
  appClientOptions = [],
  isLoadingAppClients = false,
  isLoadingUserDetails = false,
  onClose,
  onSubmit,
  onReinvite,
  canEditStatus = true,
  canEditRole = true,
  canEditAccess = true,
  canReinvite = false,
  includeSuperAdminRoleOptions = false,
  colorMode = "light",
}) {
  const isDarkMode = colorMode === "dark";
  
  const modalState = useUserPoolModal({
    open,
    mode,
    user,
    userType,
    appClientOptions,
    onSubmit,
    onClose,
    canEditStatus,
    canEditRole,
    canEditAccess,
    includeSuperAdminRoleOptions,
  });

  const {
    isViewMode,
    isAdminView,
    formData,
    setFormData,
    isSubmitting,
    isCopied,
    isEmailCopied,
    isSelectOpen,
    setIsSelectOpen,
    fieldErrors,
    setFieldErrors,
    showMfaModal,
    setShowMfaModal,
    mfaCode,
    setMfaCode,
    mfaError,
    isVerifyingMfa,
    accountTypeSelectOptions,
    isAdminAccountSetup,
    canEditThisUser,
    canEditRoleField,
    canEditAccessField,
    adminRoleOptions,
    handleCopyId,
    handleCopyEmail,
    handleStatusChange,
    handleAccountTypeChange,
    handleAdminRoleChange,
    handleSubmit,
    handleMfaVerify,
    editableAppClientIdLookup,
    roleAccessItems,
    clientAccessDisplayItems,
    manageableClientDisplayItems,
    accountTypeDisplayLabel,
  } = modalState;

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>{isViewMode ? "View User" : "Edit User"}</DialogTitle>
        </DialogHeader>
        <div className={cn("-mx-4 no-scrollbar max-h-[50vh] px-4", isSelectOpen ? "overflow-hidden" : "overflow-y-auto")}>
          <div className="px-2 mb-4 mt-2">

          </div>

          {isViewMode ? (
            <div className="space-y-6 pt-3 pb-4 px-2">
              <Card className="bg-muted/30 border-border/40 shadow-sm">
                <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {formData.givenName} {formData.middleName ? formData.middleName.charAt(0) + '. ' : ''}{formData.surname}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <p className="text-sm text-muted-foreground font-mono">
                        ID: {formData.id}
                      </p>
                      <Button size="icon-sm" variant="ghost" aria-label="Copy ID" onClick={handleCopyId}>
                        {isCopied ? <CopyCheck aria-hidden="true" className="text-[#00d053]" /> : <Copy aria-hidden="true" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isAdminView && roleAccessItems.length > 0 && (
                        <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold bg-muted/50 border-border/50 text-foreground">
                          <User className="w-3.5 h-3.5 mr-1.5" />
                          {roleAccessItems[0]}
                        </Badge>
                      )}
                      <Badge 
                        variant={formData.status?.toLowerCase() === 'active' ? 'success-outline' : 'destructive-outline'}
                        className={cn(
                          "rounded-full px-3 py-1 font-semibold",
                          formData.status?.toLowerCase() === 'active' 
                            ? "bg-[#00d053]/10 border-transparent text-[#00d053] hover:bg-[#00d053]/20" 
                            : "bg-[#ff2f3e]/10 border-transparent text-[#ff2f3e] hover:bg-[#ff2f3e]/20"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        <span className="capitalize">{formData.status}</span>
                      </Badge>
                    </div>
                    {formData.accountType && (
                      <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold bg-muted/50 border-border/50 text-foreground">
                        <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                        {accountTypeDisplayLabel}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Personal Information</h4>
                  <Card className="bg-muted/30 border-border/40">
                    <CardContent className="px-5 py-3 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground font-semibold">Email Address</Label>
                      {formData.email && (
                        <Button type="button" size="icon-sm" variant="ghost" aria-label="Copy Email" onClick={handleCopyEmail}>
                          {isEmailCopied ? <CopyCheck aria-hidden="true" className="text-[#00d053]" /> : <Copy aria-hidden="true" />}
                        </Button>
                      )}
                    </div>
                    <p className="font-medium text-sm mt-0.5 break-all">{formData.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-semibold">First Name</Label>
                    <p className="font-medium text-sm mt-0.5">{formData.givenName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-semibold">Last Name</Label>
                    <p className="font-medium text-sm mt-0.5">{formData.surname || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-semibold">Middle Name</Label>
                    <p className="font-medium text-sm mt-0.5">{formData.middleName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-semibold">Suffix</Label>
                    <p className="font-medium text-sm mt-0.5">{formData.suffix || "-"}</p>
                  </div>
                  </CardContent>
                </Card>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Accessible App Clients</h4>
                    <Card className="min-h-[4rem] border-border/40 bg-muted/30">
                      <CardContent className="px-3 py-2 flex flex-wrap gap-2">
                      {clientAccessDisplayItems.length > 0 ? (
                        clientAccessDisplayItems.map((item, idx) => (
                          <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground self-center">No clients selected</span>
                      )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Manageable App Clients</h4>
                    <Card className="min-h-[4rem] border-border/40 bg-muted/30">
                      <CardContent className="px-3 py-2 flex flex-wrap gap-2">
                      {manageableClientDisplayItems.length > 0 ? (
                        manageableClientDisplayItems.map((item, idx) => (
                          <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground self-center">No manageable clients selected</span>
                      )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form id="user-pool-form" onSubmit={handleSubmit} className="space-y-6 px-2 mt-2 pt-3 pb-6">
              <div className="space-y-6">
                {/* Name Edit Card */}
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Personal Information</h4>
                      <p className="text-sm text-muted-foreground">Edit the user's name details.</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center min-h-[24px]">
                          <Label htmlFor="givenName">First Name <span className="text-red-500">*</span></Label>
                        </div>
                        <Input 
                          id="givenName" 
                          value={formData.givenName} 
                          onChange={(e) => {
                            setFormData(curr => ({ ...curr, givenName: e.target.value }));
                            if (fieldErrors?.givenName) setFieldErrors(curr => ({ ...curr, givenName: "" }));
                          }} 
                          placeholder="Enter first name" 
                          maxLength={50}
                          className="h-10 rounded-lg"
                          aria-invalid={!!fieldErrors?.givenName}
                        />
                        {fieldErrors?.givenName && (
                          <p className="!mt-0 text-xs text-destructive">{fieldErrors.givenName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center min-h-[24px]">
                          <Label htmlFor="surname">Last Name <span className="text-red-500">*</span></Label>
                        </div>
                        <Input 
                          id="surname" 
                          value={formData.surname} 
                          onChange={(e) => {
                            setFormData(curr => ({ ...curr, surname: e.target.value }));
                            if (fieldErrors?.surname) setFieldErrors(curr => ({ ...curr, surname: "" }));
                          }} 
                          placeholder="Enter last name" 
                          maxLength={50}
                          className="h-10 rounded-lg"
                          aria-invalid={!!fieldErrors?.surname}
                        />
                        {fieldErrors?.surname && (
                          <p className="!mt-0 text-xs text-destructive">{fieldErrors.surname}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center min-h-[24px]">
                          <Label htmlFor="middleName">Middle Name</Label>
                        </div>
                        <Input 
                          id="middleName" 
                          value={formData.middleName} 
                          onChange={(e) => setFormData(curr => ({ ...curr, middleName: e.target.value }))} 
                          placeholder="Enter middle name" 
                          maxLength={50}
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between min-h-[24px]">
                          <Label htmlFor="suffix">Suffix</Label>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#7b0d15]/30 text-[#7b0d15] dark:border-[#f8d24e]/30 dark:text-[#ffe28a] tracking-wider bg-[#7b0d15]/5 dark:bg-[#f8d24e]/10">Optional</span>
                        </div>
                        <Select 
                          value={formData.suffix} 
                          onValueChange={(val) => setFormData(curr => ({ ...curr, suffix: val === "N/A" ? "" : val }))}
                        >
                          <SelectTrigger className="!h-10 w-full rounded-lg">
                            <span className={`truncate text-sm ${formData.suffix ? "text-foreground" : "text-muted-foreground"}`}>
                              <SelectValue placeholder="Enter suffix" />
                            </span>
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false} className="max-h-[300px]">
                            <SelectGroup>
                              {SUFFIX_OPTIONS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Type Card */}
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Account Type <span className="text-red-500">*</span></h4>
                      <p className="text-sm text-muted-foreground">Choose the user's account type.</p>
                    </div>
                    <Separator />
                    {!canEditStatus ? (
                      <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="capitalize">{accountTypeDisplayLabel || formData.accountType || "-"}</Badge>
                      </div>
                    ) : (
                      <Select key={accountTypeSelectOptions.length} value={formData.accountType} onValueChange={handleAccountTypeChange} onOpenChange={setIsSelectOpen}>
                        <SelectTrigger className="!h-10 w-full rounded-lg">
                          <SelectValue placeholder="Select Account Type" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {accountTypeSelectOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* 2nd Card: Role, Accessible, & Manageable Clients */}
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-5">
                    {isAdminAccountSetup && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm uppercase">Role</h4>
                          <p className="text-sm text-muted-foreground">Choose the role for this admin account.</p>
                        </div>
                        <Separator />
                        {!canEditRoleField ? (
                          <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                            {roleAccessItems.length > 0 ? (
                              roleAccessItems.map((item, idx) => <Badge key={idx}>{item}</Badge>)
                            ) : (
                              <span className="text-sm text-muted-foreground">No role assigned</span>
                            )}
                          </div>
                        ) : (
                          <UserPoolRoleRadioGroup
                            options={adminRoleOptions}
                            selectedValue={formData.roleId?.toString() || ""}
                            onChange={(val) => handleAdminRoleChange(val)}
                            colorMode={colorMode}
                            name="edit-admin-role"
                            allowEmpty={true}
                            emptyOptionLabel="No role assigned"
                          />
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm uppercase">Accessible Clients</h4>
                        <p className="text-sm text-muted-foreground">Choose which clients are accessible for sign-in.</p>
                      </div>
                      <Separator />
                      {!canEditAccessField ? (
                        <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                          {clientAccessDisplayItems.length > 0 ? (
                            clientAccessDisplayItems.map((item, idx) => <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>)
                          ) : (
                            <span className="text-sm text-muted-foreground">No clients selected</span>
                          )}
                        </div>
                      ) : (
                        <AppClientComboboxField
                          key={`accessible-${formData.accountType}`}
                          options={modalState.editableAppClientOptions}
                          selectedIds={formData.accessibleClientIds}
                          onChange={(vals) => setFormData((curr) => ({ ...curr, accessibleClientIds: vals }))}
                          placeholder="Select accessible app clients"
                          isDarkMode={isDarkMode}
                          lockedSelectedValues={formData.accessibleClientIds.filter((clientId) => !editableAppClientIdLookup.has(clientId))}
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm uppercase">Manageable Clients</h4>
                        <p className="text-sm text-muted-foreground">Choose which clients this admin can manage.</p>
                      </div>
                      <Separator />
                      {!canEditAccessField ? (
                        <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                          {manageableClientDisplayItems.length > 0 ? (
                            manageableClientDisplayItems.map((item, idx) => <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>)
                          ) : (
                            <span className="text-sm text-muted-foreground">No manageable clients selected</span>
                          )}
                        </div>
                      ) : (
                        <AppClientComboboxField
                          key={`manageable-${formData.accountType}`}
                          options={modalState.editableAppClientOptions}
                          selectedIds={formData.manageableClientIds}
                          onChange={(vals) => setFormData((curr) => ({ ...curr, manageableClientIds: vals }))}
                          placeholder="Select manageable app clients"
                          isDarkMode={isDarkMode}
                          lockedSelectedValues={formData.manageableClientIds.filter((clientId) => !editableAppClientIdLookup.has(clientId))}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 3rd Card: Status */}
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Status <span className="text-red-500">*</span></h4>
                      <p className="text-sm text-muted-foreground">Choose the user's account status.</p>
                    </div>
                    <Separator />
                    {!canEditStatus ? (
                      <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2 items-center">
                        {formData.status?.toLowerCase() === 'active' ? (
                          <Badge variant="success-outline">Active</Badge>
                        ) : formData.status?.toLowerCase() === 'suspended' ? (
                          <Badge variant="destructive-outline">Suspended</Badge>
                        ) : (
                          <Badge variant="outline" className="capitalize">{formData.status}</Badge>
                        )}
                      </div>
                    ) : (
                      <Select value={formData.status} onValueChange={handleStatusChange} onOpenChange={setIsSelectOpen}>
                        <SelectTrigger className="!h-10 w-full rounded-lg">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspend</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>
              </div>
            </form>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2">
          <div>
            {!isViewMode && canReinvite && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onReinvite?.(formData)} 
                disabled={isSubmitting || isLoadingUserDetails}
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Invite
              </Button>
            )}
          </div>
          <div className="flex gap-2 ml-auto justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && canEditThisUser && (
              <Button type="submit" form="user-pool-form" disabled={isSubmitting} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <UserPoolAuthAppMfaModal
      open={showMfaModal}
      code={mfaCode}
      onCodeChange={setMfaCode}
      onVerify={handleMfaVerify}
      onClose={() => setShowMfaModal(false)}
      isVerifying={isVerifyingMfa}
      error={mfaError}
    />
    </>
  );
}
