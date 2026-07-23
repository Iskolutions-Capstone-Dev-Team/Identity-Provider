import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function RegistrationCreateForm({
  appClientOptions = [],
  isLoadingAppClients = false,
  appClientsError = "",
  onClose,
  onSave,
  colorMode = "light",
}) {
  const [accountTypeName, setAccountTypeName] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [accountTypeNameError, setAccountTypeNameError] = useState("");

  const clearErrors = () => {
    setAccountTypeNameError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedAccountTypeName = accountTypeName.trim();

    if (!normalizedAccountTypeName) {
      setAccountTypeNameError("Account type name is required.");
      return;
    }

    try {
      clearErrors();
      await onSave({
        name: normalizedAccountTypeName,
        label: normalizedAccountTypeName,
        clientIds: selectedClientIds,
      });
    } catch (saveError) {
      // Assuming parent handles or we could show a toast here if we had sonner
    }
  };

  return (
    <div className="space-y-6">
      <form id="registration-config-form" noValidate onSubmit={handleSubmit}>
        <div>
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-0 pb-0 w-full">
              <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                ACCOUNT TYPE
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground m-0">
                Enter the account type name and pre-approve app clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Field className="w-full">
                  <FieldLabel htmlFor="account-type-name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="account-type-name"
                    type="text"
                    value={accountTypeName}
                    onChange={(event) => {
                      setAccountTypeName(event.target.value);
                      clearErrors();
                    }}
                    placeholder="Enter account type"
                    className="h-10 rounded-lg"
                  />
                  {accountTypeNameError && (
                    <p className="mt-1 text-xs text-destructive">
                      {accountTypeNameError}
                    </p>
                  )}
                </Field>
              </div>

              <div>
                <Field className="w-full">
                  <FieldLabel>
                    Accessible Clients
                  </FieldLabel>
                  <AppClientComboboxField
                    options={appClientOptions}
                    selectedIds={selectedClientIds}
                    onChange={setSelectedClientIds}
                    placeholder="Select app clients"
                    isDarkMode={colorMode === "dark"}
                  />
                  {isLoadingAppClients && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Loading app clients...
                    </p>
                  )}
                  {appClientsError && !isLoadingAppClients && (
                    <p className="mt-2 text-xs text-destructive">{appClientsError}</p>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pb-12">
        <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6 rounded-lg font-semibold hover:bg-muted">
          Cancel
        </Button>
        <Button type="submit" form="registration-config-form" className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] h-10 px-6 rounded-lg font-semibold transition-colors duration-200">
          Create Account Type
        </Button>
      </div>
    </div>
  );
}
