import { motion } from "framer-motion";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { AppClientLogoUpload } from "./AppClientLogoUpload";
import { Separator } from "@/components/ui/separator";
import { Stepper, StepperIndicator, StepperItem, StepperNav, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useAppClientCreateForm, TOKEN_TTL_LIMITS, GRANT_OPTIONS } from "../hooks/useAppClientCreateForm";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const inlineErrorClassName = "!mt-0 text-xs text-destructive";

export default function AppClientCreateForm({ onClose, onSubmit, colorMode = "light" }) {
  const formState = useAppClientCreateForm({ onSubmit });

  const {
    step,
    setStep,
    name,
    setName,
    description,
    setDescription,
    baseURL,
    setBaseURL,
    redirectURL,
    setRedirectURL,
    logoutURL,
    setLogoutURL,
    onePortalRedirectLink,
    setOnePortalRedirectLink,
    grants,
    accessTokenTTL,
    setAccessTokenTTL,
    refreshTokenTTL,
    setRefreshTokenTTL,
    setActiveVoiceField,
    error,
    setError,
    fieldErrors,
    updateFieldValue,
    activeVoiceFieldLabel,
    handleVoiceInput,
    toggleGrant,
    handleLogoChange,
    nextStep,
    handleSubmit,
  } = formState;

  const renderSectionHeader = (title, description, isRequired = false) => (
    <CardHeader className="!flex !flex-col items-start !gap-3 pb-0 w-full">
      <div className="space-y-1">
        <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
          {title} {isRequired && <span className="text-destructive">*</span>}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground m-0">
          {description}
        </CardDescription>
      </div>
      <Separator />
    </CardHeader>
  );

  const stepperSteps = [
    { title: "Basic Info" },
    { title: "URLs" },
    { title: "Grants" },
  ];

  const formContent = (
    <div className="space-y-6 w-full">
      <div className="w-full bg-card border border-border shadow-sm p-6 rounded-lg mb-6">
        <Stepper
          className="w-full max-w-md mx-auto space-y-8"
          value={step}
          indicators={{
            completed: <CheckIcon className="size-3.5" />,
            loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
          }}
        >
          <StepperNav>
            {stepperSteps.map((s, index) => (
              <StepperItem key={index} step={index + 1} className="relative flex-1 items-start">
                <StepperTrigger className="relative z-10 flex flex-col gap-2.5 items-center w-full" onClick={() => { if (index + 1 < step) setStep(index + 1) }}>
                  <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-white dark:data-[state=completed]:bg-[#ffd21a] dark:data-[state=completed]:text-black data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-white dark:data-[state=active]:bg-[#ffd21a] dark:data-[state=active]:border-[#ffd21a] dark:data-[state=active]:text-black">{index + 1}</StepperIndicator>
                  <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                </StepperTrigger>
                {index < stepperSteps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15] dark:data-[state=completed]:bg-[#ffd21a]" />}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {step === 1 && (
        <motion.div
          key="app-client-step-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <div className="flex items-center justify-between">
              {renderSectionHeader("Client Details", "Enter the app client's name, description, and system logo.")}
              <div className="pr-6">
                <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
              </div>
            </div>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>System Logo <span className="text-destructive">*</span></Label>
                <AppClientLogoUpload
                  onFilesChange={handleLogoChange}
                  maxFiles={1}
                  maxSize={MAX_LOGO_BYTES}
                  accept="image/png, image/jpeg"
                  simulateUpload={true}
                />
                {fieldErrors.imageFile && <p className={inlineErrorClassName}>{fieldErrors.imageFile}</p>}
              </div>

              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" spellCheck={false} className="h-10 rounded-lg" />
                {fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}
                {!fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Description
                  <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-medium border-[#7b0d15]/40 text-[#7b0d15] dark:border-[#f8d24e]/40 dark:text-[#f8d24e]">Optional</span>
                </Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="4" placeholder="Short description of the application" className="rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="app-client-step-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            <div className="flex items-center justify-between">
              {renderSectionHeader("Application URLs", "Set the base, redirect, logout, and One Portal redirect URLs.")}
              <div className="pr-6">
                <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
              </div>
            </div>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Base URLs <span className="text-destructive">*</span></Label>
                <Input type="url" required value={baseURL} onChange={(e) => updateFieldValue("baseURL", e.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com" className="h-10 rounded-lg" />
                {fieldErrors.baseURL && <p className={inlineErrorClassName}>{fieldErrors.baseURL}</p>}
                {!fieldErrors.baseURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label>Redirect URLs <span className="text-destructive">*</span></Label>
                <Input type="url" required value={redirectURL} onChange={(e) => updateFieldValue("redirectURL", e.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback" className="h-10 rounded-lg" />
                {fieldErrors.redirectURL && <p className={inlineErrorClassName}>{fieldErrors.redirectURL}</p>}
                {!fieldErrors.redirectURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label>Logout URLs <span className="text-destructive">*</span></Label>
                <Input type="url" required value={logoutURL} onChange={(e) => updateFieldValue("logoutURL", e.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout" className="h-10 rounded-lg" />
                {fieldErrors.logoutURL && <p className={inlineErrorClassName}>{fieldErrors.logoutURL}</p>}
                {!fieldErrors.logoutURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  One Portal Redirect Link
                  <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-medium border-[#7b0d15]/40 text-[#7b0d15] dark:border-[#f8d24e]/40 dark:text-[#f8d24e]">Optional</span>
                </Label>
                <Input type="url" value={onePortalRedirectLink} onChange={(e) => updateFieldValue("onePortalRedirectLink", e.target.value, setOnePortalRedirectLink)} onFocus={() => setActiveVoiceField("onePortalRedirectLink")} placeholder="https://one-portal.example.com" className="h-10 rounded-lg" />
                {fieldErrors.onePortalRedirectLink && <p className={inlineErrorClassName}>{fieldErrors.onePortalRedirectLink}</p>}
                {!fieldErrors.onePortalRedirectLink && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="app-client-step-3"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Card className="w-full bg-card border-border shadow-sm !gap-6">
            {renderSectionHeader("Grants & Expirations", "Select the grant types and configure token expirations for this client.")}
            <CardContent>
              <div className="space-y-3">
                <Label>Grants <span className="text-destructive">*</span></Label>
                <FieldGroup className="flex w-full flex-row flex-wrap gap-4">
                  {GRANT_OPTIONS.map((grant) => {
                    const isSelected = grants.includes(grant);
                    const formatGrantName = (name) => name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    return (
                      <FieldLabel key={grant} className="relative p-0 !w-auto flex-1 min-w-fit">
                        <Field orientation="horizontal" className="justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleGrant(grant)}
                            className="absolute -top-2 -right-2 size-5 rounded-full border bg-background shadow-sm z-10 data-checked:!bg-[#7b0d15] data-checked:!border-[#7b0d15] data-checked:!text-white dark:data-checked:!bg-[#f8d24e] dark:data-checked:!border-[#f8d24e] dark:data-checked:!text-black"
                          />
                          <FieldTitle className="justify-center text-center">{formatGrantName(grant)}</FieldTitle>
                        </Field>
                      </FieldLabel>
                    );
                  })}
                </FieldGroup>
              </div>
              {grants.length === 0 && <p className="!mt-0 text-xs text-destructive">At least one grant is required.</p>}

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Access Token expiration <span className="text-destructive">*</span></Label>
                  <InputGroup className="h-10 rounded-lg">
                    <InputGroupInput type="number" required min={TOKEN_TTL_LIMITS.accessToken.min} max={TOKEN_TTL_LIMITS.accessToken.max} value={accessTokenTTL} onChange={(e) => updateFieldValue("accessTokenTTL", e.target.value, setAccessTokenTTL)} />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>min</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldErrors.accessTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.accessTokenTTL}</p>}
                  {!fieldErrors.accessTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1-1,440 minutes (24 hours)</p>}
                </div>

                <div className="space-y-2">
                  <Label>Refresh Token expiration <span className="text-destructive">*</span></Label>
                  <InputGroup className="h-10 rounded-lg">
                    <InputGroupInput type="number" required min={TOKEN_TTL_LIMITS.refreshToken.min} max={TOKEN_TTL_LIMITS.refreshToken.max} value={refreshTokenTTL} onChange={(e) => updateFieldValue("refreshTokenTTL", e.target.value, setRefreshTokenTTL)} />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>hr</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldErrors.refreshTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.refreshTokenTTL}</p>}
                  {!fieldErrors.refreshTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1 - 8,760 hours (1 year)</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  const footerActions = (
    <div className="flex flex-col-reverse gap-3 mt-4 md:mb-12 lg:flex-row lg:justify-end xl:mb-16 [&>button]:w-full lg:[&>button]:w-auto w-full">
      {step === 1 ? (
        <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-lg px-6">Cancel</Button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-10 rounded-lg px-6">Back</Button>
      )}

      {step < 3 ? (
        <Button type="button" onClick={nextStep} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] transition-colors">Next</Button>
      ) : (
        <Button type="button" onClick={handleSubmit} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] transition-colors">Create Client</Button>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {formContent}
        {footerActions}
      </div>
    </>
  );
}
