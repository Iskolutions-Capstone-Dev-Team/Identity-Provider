import { useEffect, useMemo, useState, Fragment } from "react";
import MultiSelect from "../../../components/MultiSelect";
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeOption } from "../../../utils/accountTypes";
import { RegistrationIcon } from "./registrationIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";

function AppClientComboboxField({ options, selectedIds, onChange, placeholder, isDarkMode, lockedSelectedValues = [] }) {
  const anchor = useComboboxAnchor();
  const stringifiedSelectedIds = selectedIds.map(id => String(id));
  
  const chipClassName = isDarkMode
    ? "rounded-md border border-[#f8d24e]/25 bg-[#f8d24e]/12 text-[#ffe28a]"
    : "rounded-md border border-[#7b0d15]/20 bg-[#7b0d15]/10 text-[#7b0d15]";
  
  const comboboxContainerClassName = `min-h-[2.625rem] rounded-md transition-[border-color,box-shadow,background-color] duration-200`;
  
  const inputPlaceholderClassName = isDarkMode
    ? "placeholder:text-[#a58d95] text-[#f4eaea] bg-transparent outline-none flex-1 ml-1"
    : "placeholder:text-[#9b7d84] text-[#4a1921] bg-transparent outline-none flex-1 ml-1";
  
  return (
    <Combobox multiple autoHighlight items={options} itemToString={(item) => (item ? item.label : "")} value={stringifiedSelectedIds} onValueChange={onChange}>
      <ComboboxChips ref={anchor} className={comboboxContainerClassName}>
        <ComboboxValue>
          {(values) => (
            <Fragment>
              {values.map((val) => {
                const opt = options.find(o => String(o.value ?? o.id) === String(val));
                const isLocked = lockedSelectedValues.includes(val) || lockedSelectedValues.includes(Number(val));
                return (
                  <ComboboxChip key={val} className={chipClassName} showRemove={!isLocked}>
                    {opt ? opt.label : val}
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput placeholder={placeholder} className={inputPlaceholderClassName} />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No client found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            const optValue = String(item.value ?? item.id);
            return (
              <ComboboxItem key={optValue} value={optValue}>
                {item.label}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function getClientNames(clientIds = [], appClientOptions = []) {
  const clientLabelLookup = new Map(
    (Array.isArray(appClientOptions) ? appClientOptions : []).map((client) => [
      client.id,
      client.label,
    ]),
  );

  return (Array.isArray(clientIds) ? clientIds : [])
    .map((clientId) => clientLabelLookup.get(clientId))
    .filter(Boolean);
}

export default function RegistrationConfigModal({ open, mode = "view", config = null, appClientOptions = [], isLoadingAppClients = false, appClientsError = "", onClose, onSave, colorMode = "light" }) {
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [accountTypeNameError, setAccountTypeNameError] = useState("");

  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  
  const isLockedDefaultAccountType =
    !isCreateMode &&
    Boolean(
      getAccountTypeOption(
        config?.accountTypeValue ?? config?.accountType ?? config?.label,
        ACCOUNT_TYPE_OPTIONS,
      ),
    );

  useEffect(() => {
    if (!open) return;

    setAccountTypeName(config?.label ?? "");
    setSelectedClientIds(Array.isArray(config?.clientIds) ? config.clientIds : []);
    setAccountTypeNameError("");
  }, [config, open]);

  const displayedClientNames = useMemo(
    () => {
      if (isViewMode) {
        return Array.isArray(config?.clientNames) && config.clientNames.length > 0
          ? config.clientNames
          : getClientNames(config?.clientIds, appClientOptions);
      }
      return getClientNames(selectedClientIds, appClientOptions);
    },
    [appClientOptions, config, isViewMode, selectedClientIds],
  );

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    const normalizedAccountTypeName = accountTypeName.trim();
    const nextAccountTypeName = isLockedDefaultAccountType
      ? normalizedAccountTypeName || config?.label?.trim() || ""
      : normalizedAccountTypeName;

    if (!nextAccountTypeName) {
      setAccountTypeNameError("Account type name is required.");
      return;
    }

    try {
      setAccountTypeNameError("");
      await onSave({
        ...config,
        name: nextAccountTypeName,
        label: nextAccountTypeName,
        clientIds: selectedClientIds,
      });
      onClose();
    } catch (saveError) {
      // Could show toast here
    }
  };

  const modalTitle = isCreateMode
    ? "Create Registration"
    : isViewMode
      ? "View Registration"
      : "Edit Registration";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-3xl" closeButtonClassName={!isCreateMode ? "text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" : undefined}>
        <DialogHeader className={!isCreateMode ? "-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground" : undefined}>
          <DialogTitle>{modalTitle}</DialogTitle>
          {isCreateMode && (
            <DialogDescription>
              Configure the account type and pre-approved app clients.
            </DialogDescription>
          )}
        </DialogHeader>

        <form id="registration-modal-form" onSubmit={handleSubmit} className="space-y-6 -mx-4 no-scrollbar max-h-[60vh] px-4 overflow-y-auto pb-2">
          {isViewMode ? (
            <div className="space-y-6 pt-4 pb-4 px-2">
              <Card className="bg-muted/30 border-border/40 shadow-sm">
                <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {accountTypeName || config?.label || ""}
                    </h2>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  Accessible Clients
                </h4>
                <Card className="bg-muted/30 border-border/40 shadow-sm">
                  <CardContent className="px-5 py-4">
                    {displayedClientNames.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {displayedClientNames.map((clientName) => (
                          <Badge key={clientName} variant="secondary" className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">
                            {clientName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No pre-approved clients</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Field className="w-full">
                <FieldLabel htmlFor="account-type-name">
                  Account Type {!isLockedDefaultAccountType && <span className="text-destructive">*</span>}
                </FieldLabel>
                {isLockedDefaultAccountType ? (
                  <Input
                    id="account-type-name"
                    value={accountTypeName || config?.label || ""}
                    readOnly
                    disabled
                    className="h-10 rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed border-input opacity-70 hover:opacity-70"
                  />
                ) : (
                  <div>
                    <Input
                      id="account-type-name"
                      value={accountTypeName}
                      onChange={(e) => {
                        setAccountTypeName(e.target.value);
                        setAccountTypeNameError("");
                      }}
                      placeholder="Enter account type"
                      className={`h-10 rounded-lg ${accountTypeNameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {accountTypeNameError && (
                      <p className="mt-1 text-xs text-destructive">{accountTypeNameError}</p>
                    )}
                  </div>
                )}
              </Field>

              <Field className="w-full">
                <FieldLabel>
                  Accessible Clients
                </FieldLabel>
                <div>
                  <AppClientComboboxField
                    options={appClientOptions}
                    selectedIds={selectedClientIds}
                    onChange={setSelectedClientIds}
                    placeholder="Select app clients"
                    isDarkMode={colorMode === "dark"}
                  />
                  {isLoadingAppClients && (
                    <p className="mt-2 text-xs text-muted-foreground">Loading app clients...</p>
                  )}
                  {appClientsError && !isLoadingAppClients && (
                    <p className="mt-2 text-xs text-destructive">{appClientsError}</p>
                  )}
                </div>
              </Field>
            </div>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button 
                type="submit" 
                form="registration-modal-form" 
                className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-bold transition-colors duration-200"
              >
                {isCreateMode ? "Create" : "Save"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}