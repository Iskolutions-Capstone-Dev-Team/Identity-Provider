import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { AppClientIcon } from "./AppClientIconBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { AppClientLogoUpload } from "./AppClientLogoUpload";
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperNav, StepperPanel, StepperSeparator, StepperTitle, StepperTrigger } from "../../../components/reui/stepper";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const GRANT_OPTIONS = ["authorization_code", "refresh_token", "client_credentials"];
const TOKEN_TTL_LIMITS = {
  accessToken: { min: 1, max: 1440, defaultValue: "60" },
  refreshToken: { min: 1, max: 8760, defaultValue: "168" },
};
const initialFieldErrors = {
  imageFile: "", name: "", baseURL: "", redirectURL: "",
  logoutURL: "", onePortalRedirectLink: "", accessTokenTTL: "", refreshTokenTTL: "",
};
const inlineErrorClassName = "mt-2 text-xs text-destructive";

const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const parseTokenTTL = (value) => Number.parseInt(value, 10);
const isValidTokenTTL = (value, { min, max }) => Number.isInteger(value) && value >= min && value <= max;

export default function AppClientCreateForm({ onClose, onSubmit, colorMode = "light" }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [onePortalRedirectLink, setOnePortalRedirectLink] = useState("");
  const [grants, setGrants] = useState(["authorization_code"]);
  const [accessTokenTTL, setAccessTokenTTL] = useState(TOKEN_TTL_LIMITS.accessToken.defaultValue);
  const [refreshTokenTTL, setRefreshTokenTTL] = useState(TOKEN_TTL_LIMITS.refreshToken.defaultValue);
  const [imageFile, setImageFile] = useState(null);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);

  useEffect(() => {
    if (step === 1) {
      if (!["name", "description"].includes(activeVoiceField)) setActiveVoiceField("name");
      return;
    }
    if (step === 2 && !["baseURL", "redirectURL", "logoutURL", "onePortalRedirectLink"].includes(activeVoiceField)) {
      setActiveVoiceField("baseURL");
    }
  }, [activeVoiceField, step]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) => current[fieldName] ? { ...current, [fieldName]: "" } : current);
  };

  const updateFieldValue = (fieldName, value, setter) => {
    setter(value);
    clearFieldError(fieldName);
    if (error) setError("");
  };

  const voiceFieldLabels = {
    description: "Description", baseURL: "Base URL", redirectURL: "Redirect URL",
    logoutURL: "Logout URL", onePortalRedirectLink: "One Portal Redirect Link",
  };
  const activeVoiceFieldLabel = voiceFieldLabels[activeVoiceField] || "Name";

  const handleVoiceInput = (transcript) => {
    if (activeVoiceField === "description") {
      setError("");
      setDescription((curr) => curr.trim() ? `${curr.trimEnd()} ${transcript}` : transcript);
      return;
    }
    if (activeVoiceField === "baseURL") return updateFieldValue("baseURL", transcript, setBaseURL);
    if (activeVoiceField === "redirectURL") return updateFieldValue("redirectURL", transcript, setRedirectURL);
    if (activeVoiceField === "logoutURL") return updateFieldValue("logoutURL", transcript, setLogoutURL);
    if (activeVoiceField === "onePortalRedirectLink") return updateFieldValue("onePortalRedirectLink", transcript, setOnePortalRedirectLink);
    updateFieldValue("name", transcript, setName);
  };

  const validateBasicInfo = () => {
    const trimmedName = name.trim();
    const nextFieldErrors = { ...initialFieldErrors, baseURL: fieldErrors.baseURL, redirectURL: fieldErrors.redirectURL, logoutURL: fieldErrors.logoutURL, onePortalRedirectLink: fieldErrors.onePortalRedirectLink };

    if (!imageFile) nextFieldErrors.imageFile = "System logo is required.";
    if (!trimmedName) nextFieldErrors.name = "Client name is required.";
    else if (trimmedName.length < 5 || trimmedName.length > 100) nextFieldErrors.name = "Client name must be between 5 and 100 characters.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.imageFile || nextFieldErrors.name;
    if (firstError) {
      setError(firstError);
      return false;
    }
    return true;
  };

  const validateUrls = () => {
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const trimmedOnePortalRedirectLink = onePortalRedirectLink.trim();
    const nextFieldErrors = { ...initialFieldErrors, imageFile: fieldErrors.imageFile, name: fieldErrors.name };

    if (!trimmedBaseURL) nextFieldErrors.baseURL = "Base URL is required.";
    else if (!isValidHttpUrl(trimmedBaseURL)) nextFieldErrors.baseURL = "Base URL must be a valid URL.";
    if (!trimmedRedirectURL) nextFieldErrors.redirectURL = "Redirect URL is required.";
    else if (!isValidHttpUrl(trimmedRedirectURL)) nextFieldErrors.redirectURL = "Redirect URL must be a valid URL.";
    if (!trimmedLogoutURL) nextFieldErrors.logoutURL = "Logout URL is required.";
    else if (!isValidHttpUrl(trimmedLogoutURL)) nextFieldErrors.logoutURL = "Logout URL must be a valid URL.";
    if (trimmedOnePortalRedirectLink && !isValidHttpUrl(trimmedOnePortalRedirectLink)) nextFieldErrors.onePortalRedirectLink = "One Portal Redirect Link must be a valid URL.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.baseURL || nextFieldErrors.redirectURL || nextFieldErrors.logoutURL || nextFieldErrors.onePortalRedirectLink;
    if (firstError) {
      setError(firstError);
      return false;
    }
    return true;
  };

  const validateTokenSettings = () => {
    const parsedAccessTokenTTL = parseTokenTTL(accessTokenTTL);
    const parsedRefreshTokenTTL = parseTokenTTL(refreshTokenTTL);
    const nextFieldErrors = { ...initialFieldErrors, imageFile: fieldErrors.imageFile, name: fieldErrors.name, baseURL: fieldErrors.baseURL, redirectURL: fieldErrors.redirectURL, logoutURL: fieldErrors.logoutURL, onePortalRedirectLink: fieldErrors.onePortalRedirectLink };

    if (!isValidTokenTTL(parsedAccessTokenTTL, TOKEN_TTL_LIMITS.accessToken)) nextFieldErrors.accessTokenTTL = "Expiration must be between 1 and 1,440 minutes.";
    if (!isValidTokenTTL(parsedRefreshTokenTTL, TOKEN_TTL_LIMITS.refreshToken)) nextFieldErrors.refreshTokenTTL = "Expiration must be between 1 and 8,760 hours.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.accessTokenTTL || nextFieldErrors.refreshTokenTTL;
    if (firstError) {
      setError(firstError);
      return false;
    }
    return true;
  };

  const toggleGrant = (grant) => {
    if (grants.includes(grant)) setGrants(grants.filter((value) => value !== grant));
    else setGrants([...grants, grant]);
    if (error) setError("");
  };

  const handleLogoChange = (file) => {
    setImageFile(file);
    if (file) {
      clearFieldError("imageFile");
      setError("");
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateBasicInfo()) return;
    if (step === 2 && !validateUrls()) return;
    if (step === 3 && grants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }
    if (step === 3 && !validateTokenSettings()) return;
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) return setStep(1);
    if (!validateUrls()) return setStep(2);
    if (grants.length === 0) {
      setError("At least one grant must be selected.");
      return setStep(3);
    }
    if (!validateTokenSettings()) return setStep(3);

    setError("");
    try {
      await onSubmit({
        name, description, base_url: baseURL, redirect_uri: redirectURL, logout_uri: logoutURL,
        one_portal_redirect_link: onePortalRedirectLink, grants,
        access_token_ttl: parseTokenTTL(accessTokenTTL), refresh_token_ttl: parseTokenTTL(refreshTokenTTL), imageFile,
      });
    } catch (submitError) {
      console.error("Create app client error:", submitError);
      setError(submitError?.message || "Unable to create app client. Please review the details and try again.");
    }
  };

  const renderSectionHeader = (title, description, isRequired = false) => (
    <CardHeader className="!flex !flex-col items-start !gap-0 pb-0 w-full">
      <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground m-0">
        {description}
      </CardDescription>
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
                <StepperTrigger className="relative z-10 flex flex-col gap-2.5 items-center w-full" onClick={() => { if(index + 1 < step) setStep(index + 1) }}>
                  <StepperIndicator className="size-8 text-sm data-[state=inactive]:bg-secondary data-[state=completed]:bg-[#7b0d15] data-[state=completed]:text-white data-[state=active]:bg-[#7b0d15] data-[state=active]:border-[#7b0d15] data-[state=active]:text-white">{index + 1}</StepperIndicator>
                  <StepperTitle className="text-sm font-semibold whitespace-nowrap">{s.title}</StepperTitle>
                </StepperTrigger>
                {index < stepperSteps.length - 1 && <StepperSeparator className="absolute top-4 left-[50%] w-full z-0 h-1 data-[state=completed]:bg-[#7b0d15]" />}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      <ErrorAlert message={error} onClose={() => setError("")} />

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
                <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" className={`h-10 rounded-lg ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                {fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}
                {!fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="4" placeholder="Short description of the application (optional)" className="rounded-lg" />
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
                  <Input type="url" required value={baseURL} onChange={(e) => updateFieldValue("baseURL", e.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com" className={`h-10 rounded-lg ${fieldErrors.baseURL ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                  {fieldErrors.baseURL && <p className={inlineErrorClassName}>{fieldErrors.baseURL}</p>}
                  {!fieldErrors.baseURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                </div>

                <div className="space-y-2">
                  <Label>Redirect URLs <span className="text-destructive">*</span></Label>
                  <Input type="url" required value={redirectURL} onChange={(e) => updateFieldValue("redirectURL", e.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback" className={`h-10 rounded-lg ${fieldErrors.redirectURL ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                  {fieldErrors.redirectURL && <p className={inlineErrorClassName}>{fieldErrors.redirectURL}</p>}
                  {!fieldErrors.redirectURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                </div>

                <div className="space-y-2">
                  <Label>Logout URLs <span className="text-destructive">*</span></Label>
                  <Input type="url" required value={logoutURL} onChange={(e) => updateFieldValue("logoutURL", e.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout" className={`h-10 rounded-lg ${fieldErrors.logoutURL ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                  {fieldErrors.logoutURL && <p className={inlineErrorClassName}>{fieldErrors.logoutURL}</p>}
                  {!fieldErrors.logoutURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                </div>

                <div className="space-y-2">
                  <Label>One Portal Redirect Link</Label>
                  <Input type="url" value={onePortalRedirectLink} onChange={(e) => updateFieldValue("onePortalRedirectLink", e.target.value, setOnePortalRedirectLink)} onFocus={() => setActiveVoiceField("onePortalRedirectLink")} placeholder="https://one-portal.example.com" className={`h-10 rounded-lg ${fieldErrors.onePortalRedirectLink ? "border-destructive focus-visible:ring-destructive" : ""}`} />
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
                            className="absolute -top-2 -right-2 size-5 rounded-full border bg-background shadow-sm z-10" 
                          />
                          <FieldTitle className="justify-center text-center">{formatGrantName(grant)}</FieldTitle>
                        </Field>
                      </FieldLabel>
                    );
                  })}
                </FieldGroup>
              </div>
              {grants.length === 0 && <p className="mt-3 text-xs text-destructive">At least one grant is required.</p>}

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Access Token expiration <span className="text-destructive">*</span></Label>
                  <InputGroup className={`h-10 rounded-lg ${fieldErrors.accessTokenTTL ? "border-destructive focus-within:border-destructive focus-within:ring-destructive" : ""}`}>
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
                  <InputGroup className={`h-10 rounded-lg ${fieldErrors.refreshTokenTTL ? "border-destructive focus-within:border-destructive focus-within:ring-destructive" : ""}`}>
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
        <Button type="button" onClick={nextStep} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors">Next</Button>
      ) : (
        <Button type="button" onClick={handleSubmit} className="h-10 rounded-lg px-6 bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] transition-colors">Create Client</Button>
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
