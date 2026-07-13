import { useEffect, useRef, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import MultiSelect from "../../../components/MultiSelect";
import { useAllRoles } from "../../roles/hooks/useAllRoles";
import { ADMIN_USER_TYPE, getAdminRoleOptions, getAllAppClientSelectOptions, getAppClientNamesByIds } from "../../../utils/userPoolAccess";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckIcon, User, Copy, CopyCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const initialFormData = {
  id: "",
  email: "",
  givenName: "",
  middleName: "",
  surname: "",
  suffix: "",
  status: "active",
  roleId: null,
  roles: [],
  accessibleClientIds: [],
  accessibleClientNames: [],
  manageableClientIds: [],
  manageableClientNames: [],
};

const STATUS_VALUES = new Set(["active", "inactive", "suspended"]);
const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeStatus = (value) => {
  const normalizedValue = normalizeText(value).toLowerCase();
  return STATUS_VALUES.has(normalizedValue) ? normalizedValue : "active";
};
const normalizeRoleId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = Number.parseInt(value, 10);
  return Number.isInteger(normalizedValue) && normalizedValue > 0 ? normalizedValue : null;
};
const normalizeClientIds = (clientIds) =>
  Array.from(new Set((Array.isArray(clientIds) ? clientIds : []).filter(Boolean)));
const normalizeClientNames = (clientNames) =>
  Array.from(
    new Set(
      (Array.isArray(clientNames) ? clientNames : [])
        .map((clientName) => (typeof clientName === "string" ? clientName.trim() : ""))
        .filter(Boolean),
    ),
  );
const normalizeRoleNames = (roles) => {
  const normalizedRoles = Array.isArray(roles) ? roles : roles === null || roles === undefined ? [] : [roles];
  return Array.from(
    new Set(
      normalizedRoles
        .map((role) => {
          if (typeof role === "string") return role.trim();
          return normalizeText(role?.role_name || role?.roleName || role?.name);
        })
        .filter(Boolean),
    ),
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
  suffix: user?.suffix || user?.name_suffix || user?.suffixName || user?.suffix_name || "",
  status: normalizeStatus(user?.status),
  roleId: normalizeRoleId(user?.roleId),
  roles: normalizeRoleNames(user?.roles),
  accessibleClientIds: normalizeClientIds(user?.accessibleClientIds),
  accessibleClientNames: normalizeClientNames(user?.accessibleClientNames),
  manageableClientIds: normalizeClientIds(user?.manageableClientIds),
  manageableClientNames: normalizeClientNames(user?.manageableClientNames),
});

const getSelectedClientOptions = (clientIds = [], clientNames = []) =>
  normalizeClientIds(clientIds).map((clientId, index) => ({
    id: clientId,
    label: normalizeText(clientNames[index]) || clientId,
  }));

const mergeClientOptions = (baseOptions = [], ...selectedOptionLists) => {
  const optionMap = new Map();
  baseOptions.forEach((option) => {
    if (option?.id && option?.label) optionMap.set(option.id, option);
  });
  selectedOptionLists.flat().forEach((option) => {
    if (option?.id && option?.label && !optionMap.has(option.id)) optionMap.set(option.id, option);
  });
  return Array.from(optionMap.values());
};

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
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAdminView = userType === ADMIN_USER_TYPE;
  const rolesEndpoint = isAdminView && includeSuperAdminRoleOptions ? "all" : userType === ADMIN_USER_TYPE ? "default" : "all";
  
  const canEditThisUser = isAdminView ? canEditStatus || canEditRole || canEditAccess : canEditStatus || canEditAccess;
  const canEditRoleField = isAdminView && canEditRole;
  const canEditAccessField = canEditAccess;
  
  const availableRoles = useAllRoles({
    endpoint: rolesEndpoint,
    enabled: open && isAdminView,
  });
  const adminRoleOptions = getAdminRoleOptions(availableRoles, {
    includeSuperAdmin: includeSuperAdminRoleOptions,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [originalUser, setOriginalUser] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setIsCopied(false);
    setError("");
  }, [open, user]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(formData.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStatusChange = (value) => {
    setFormData((current) => ({ ...current, status: normalizeStatus(value) }));
    if (error) setError("");
  };

  const handleAdminRoleChange = (roleId) => {
    const normalizedRoleId = normalizeRoleId(roleId);
    const selectedRole = adminRoleOptions.find((role) => role.id === normalizedRoleId);
    setFormData((current) => ({
      ...current,
      roleId: normalizedRoleId,
      roles: selectedRole ? [selectedRole.role_name] : [],
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (isViewMode || !canEditThisUser) {
      onClose();
      return;
    }
    if (!STATUS_VALUES.has(formData.status)) {
      setError("Select a valid status.");
      return;
    }
    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError("");
      await onSubmit({ ...formData, userType }, originalUser);
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const editableAppClientOptions = getAllAppClientSelectOptions(appClientOptions);
  const editableAppClientIdLookup = new Set(editableAppClientOptions.map((client) => client.id).filter(Boolean));
  const appClientSelectOptions = mergeClientOptions(
    editableAppClientOptions,
    getSelectedClientOptions(formData.accessibleClientIds, formData.accessibleClientNames),
    getSelectedClientOptions(formData.manageableClientIds, formData.manageableClientNames),
  );
  
  const roleAccessItems = formData.roles.length > 0 ? formData.roles : adminRoleOptions.filter((role) => role.id === formData.roleId).map((role) => role.role_name);
  const clientAccessDisplayItems = formData.accessibleClientNames.length > 0 ? formData.accessibleClientNames : getAppClientNamesByIds(formData.accessibleClientIds, appClientSelectOptions);
  const manageableClientDisplayItems = formData.manageableClientNames.length > 0 ? formData.manageableClientNames : getAppClientNamesByIds(formData.manageableClientIds, appClientSelectOptions);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground">
          <DialogTitle>{isViewMode ? "View User" : "Edit User"}</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          <div className="px-2 mb-4 mt-2">
            <ErrorAlert message={error} onClose={() => setError("")} />
          </div>

          {isViewMode ? (
            <div className="space-y-6 pt-0 pb-4 px-2">
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
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Personal Information</h4>
                  <Card className="bg-muted/30 border-border/40">
                    <CardContent className="px-5 py-3 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground font-semibold">Email Address</Label>
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
            <form id="user-pool-form" onSubmit={handleSubmit} className="space-y-8 px-2 mt-4">
              <section className="space-y-4">
                <div>
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">View the user's basic details.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={formData.id} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={formData.givenName} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={formData.surname} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Middle Name</Label>
                    <Input value={formData.middleName} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between w-full">
                      <Label>Suffix</Label>
                      <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-medium border-[#7b0d15]/40 text-[#7b0d15] dark:border-[#f8d24e]/40 dark:text-[#f8d24e]">Optional</span>
                    </div>
                    <Input value={formData.suffix} readOnly className="bg-muted h-10 rounded-lg" />
                  </div>
                </div>
              </section>

              <section className="space-y-6 mt-6">
                {isAdminView && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Role</h4>
                      <p className="text-sm text-muted-foreground">Choose the role for this admin account.</p>
                    </div>
                    
                    {!canEditRoleField ? (
                      <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                        {roleAccessItems.length > 0 ? (
                          roleAccessItems.map((item, idx) => <Badge key={idx}>{item}</Badge>)
                        ) : (
                          <span className="text-sm text-muted-foreground">No role assigned</span>
                        )}
                      </div>
                    ) : (
                      <RadioGroup 
                        value={formData.roleId?.toString() || ""} 
                        onValueChange={(val) => handleAdminRoleChange(val)}
                        className="gap-4"
                      >
                        {adminRoleOptions.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                            <Label htmlFor={`role-${role.id}`}>{role.role_name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Status <span className="text-destructive">*</span></h4>
                    <p className="text-sm text-muted-foreground">Choose the user's account status.</p>
                  </div>
                  
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
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspend</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Accessible App Clients</h4>
                    <p className="text-sm text-muted-foreground">Choose which clients are accessible for sign-in.</p>
                  </div>
                  
                  {!canEditAccessField ? (
                    <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                      {clientAccessDisplayItems.length > 0 ? (
                        clientAccessDisplayItems.map((item, idx) => <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">No clients selected</span>
                      )}
                    </div>
                  ) : (
                    <MultiSelect
                      options={appClientSelectOptions}
                      selectedValues={formData.accessibleClientIds}
                      onChange={(vals) => setFormData((curr) => ({ ...curr, accessibleClientIds: vals }))}
                      placeholder="Select accessible app clients"
                      lockedSelectedValues={formData.accessibleClientIds.filter((clientId) => !editableAppClientIdLookup.has(clientId))}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Manageable App Clients</h4>
                    <p className="text-sm text-muted-foreground">Choose which clients this admin can manage.</p>
                  </div>
                  
                  {!canEditAccessField ? (
                    <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                      {manageableClientDisplayItems.length > 0 ? (
                        manageableClientDisplayItems.map((item, idx) => <Badge className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1" key={idx}>{item}</Badge>)
                      ) : (
                        <span className="text-sm text-muted-foreground">No manageable clients selected</span>
                      )}
                    </div>
                  ) : (
                    <MultiSelect
                      options={appClientSelectOptions}
                      selectedValues={formData.manageableClientIds}
                      onChange={(vals) => setFormData((curr) => ({ ...curr, manageableClientIds: vals }))}
                      placeholder="Select manageable app clients"
                      lockedSelectedValues={formData.manageableClientIds.filter((clientId) => !editableAppClientIdLookup.has(clientId))}
                    />
                  )}
                </div>
              </section>
            </form>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && canEditThisUser && (
              <Button type="submit" form="user-pool-form" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
