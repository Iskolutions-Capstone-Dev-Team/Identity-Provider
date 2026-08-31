import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppClientComboboxField from "./AppClientComboboxField";
import { useRegistrationForm } from "../hooks/useRegistrationForm";

export default function RegistrationCreateForm({
  appClientOptions = [],
  isLoadingAppClients = false,
  appClientsError = "",
  onClose,
  onSave,
  colorMode = "light",
}) {
  const formState = useRegistrationForm({
    mode: "create",
    appClientOptions,
    onSave,
    onClose,
  });

  const {
    accountTypeName,
    selectedClientIds,
    setSelectedClientIds,
    accountTypeNameError,
    handleAccountTypeNameChange,
    handleSubmit
  } = formState;

  return (
    <div className="space-y-6">
      <form id="registration-config-form" noValidate onSubmit={handleSubmit}>
        <div>
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <CardHeader className="!flex !flex-col items-start !gap-3 pb-0 w-full">
              <div className="space-y-1">
                <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
                  ACCOUNT TYPE
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground m-0">
                  Enter the account type name and pre-approve app clients.
                </CardDescription>
              </div>
              <Separator />
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
                    onChange={(event) => handleAccountTypeNameChange(event.target.value)}
                    placeholder="Enter account type"
                    className="h-10 rounded-lg"
                  />
                  {accountTypeNameError && (
                    <p className="!mt-0 text-xs text-destructive">
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
                    <p className="!mt-0 text-xs text-destructive">{appClientsError}</p>
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
        <Button type="submit" form="registration-config-form" className="bg-[#7b0d15] text-white dark:bg-[#ffd21a] dark:text-black hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-white h-10 px-6 rounded-lg font-semibold transition-colors duration-200">
          Create Account Type
        </Button>
      </div>
    </div>
  );
}
