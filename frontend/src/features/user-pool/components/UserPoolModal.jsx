import { useEffect, useRef, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import MultiSelect from "../../../components/MultiSelect";
import { useAllRoles } from "../../roles/hooks/useAllRoles";
import {
  ADMIN_USER_TYPE,
  getAdminRoleOptions,
  getAllAppClientSelectOptions,
  getAppClientNamesByIds,
} from "../../../utils/userPoolAccess";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const nextFormData = createFormData(user);
    setFormData(nextFormData);
    setOriginalUser(nextFormData);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setError("");
  }, [open, user]);

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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{isViewMode ? "View User" : "Edit User"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <form id="user-pool-form" onSubmit={handleSubmit} className="space-y-8">
            <ErrorAlert message={error} onClose={() => setError("")} />

            {!isEditMode && (
              <section className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">View the user's basic details.</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={formData.id} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={formData.givenName} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={formData.surname} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Middle Name</Label>
                    <Input value={formData.middleName} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Suffix <span className="text-muted-foreground text-xs font-normal ml-2">Optional</span></Label>
                    <Input value={formData.suffix} readOnly className="bg-muted" />
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-6">
              {isAdminView && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Role</h4>
                    <p className="text-sm text-muted-foreground">{isViewMode ? "View the role assigned to this admin account." : "Choose the role for this admin account."}</p>
                  </div>
                  
                  {isViewMode || !canEditRoleField ? (
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
                  <h4 className="text-sm font-semibold">Accessible App Clients</h4>
                  <p className="text-sm text-muted-foreground">{isViewMode ? "View which app clients are accessible for sign-in." : "Choose which clients are accessible for sign-in."}</p>
                </div>
                
                {isViewMode || !canEditAccessField ? (
                  <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                    {clientAccessDisplayItems.length > 0 ? (
                      clientAccessDisplayItems.map((item, idx) => <Badge variant="outline" key={idx}>{item}</Badge>)
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
                  <h4 className="text-sm font-semibold">Manageable App Clients</h4>
                  <p className="text-sm text-muted-foreground">{isViewMode ? "View which app clients this admin can manage." : "Choose which clients this admin can manage."}</p>
                </div>
                
                {isViewMode || !canEditAccessField ? (
                  <div className="min-h-[4rem] p-4 rounded-md border bg-muted/50 flex flex-wrap gap-2">
                    {manageableClientDisplayItems.length > 0 ? (
                      manageableClientDisplayItems.map((item, idx) => <Badge variant="outline" key={idx}>{item}</Badge>)
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

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">Status {(!isViewMode) && <span className="text-destructive">*</span>}</h4>
                  <p className="text-sm text-muted-foreground">{isViewMode ? "View the user's account status." : "Choose the user's account status."}</p>
                </div>
                
                {isViewMode || !canEditStatus ? (
                  <Input value={formData.status} readOnly className="bg-muted capitalize" />
                ) : (
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspend</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </section>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 sm:justify-between">
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
