import { Fragment, useEffect, useState } from "react";
import FadeWrapper from "../../../components/FadeWrapper";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { AppClientIcon } from "./AppClientIconBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

function AppClientStepIndicator({ currentStep }) {
  const steps = [
    { label: "Basic Info", shortLabel: "Info", icon: <AppClientIcon className="h-4 w-4" /> },
    {
      label: "URLs", shortLabel: "URLs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
        </svg>
      ),
    },
    {
      label: "Grants", shortLabel: "Grants",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[38rem] grid-cols-[minmax(4.5rem,auto)_1fr_minmax(4.5rem,auto)_1fr_minmax(4.5rem,auto)] items-start gap-2 px-3 py-4 sm:gap-3 sm:px-4">
      {steps.map((stepItem, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;
        const lineIsActive = currentStep > stepNumber;
        return (
          <Fragment key={stepItem.label}>
            <div className="flex min-w-0 flex-col items-center gap-2">
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${isActive ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground"}`}>
                {stepItem.icon}
              </span>
              <span className={`text-center text-xs font-semibold leading-tight transition-colors duration-300 sm:text-sm ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <span className="sm:hidden">{stepItem.shortLabel}</span>
                <span className="hidden sm:inline">{stepItem.label}</span>
              </span>
            </div>
            {index < steps.length - 1 && <span className={`mt-5 h-px flex-1 border-t-2 border-dotted ${lineIsActive ? "border-primary/50" : "border-border"}`} aria-hidden="true" />}
          </Fragment>
        );
      })}
    </div>
  );
}

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
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
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

  const validateAndProcessFile = (file) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const message = "System logo must be a PNG or JPG file.";
      setFieldErrors((current) => ({ ...current, imageFile: message }));
      setError(message);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      const message = "System logo must be 5MB max.";
      setFieldErrors((current) => ({ ...current, imageFile: message }));
      setError(message);
      return;
    }
    clearFieldError("imageFile");
    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => validateAndProcessFile(event.target.files?.[0]);
  const handleDragOver = (event) => { event.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (event) => { event.preventDefault(); setIsDragging(false); validateAndProcessFile(event.dataTransfer.files?.[0]); };
  const removeImage = () => {
    setImagePreview(null); setImageFile(null); clearFieldError("imageFile");
    const input = document.getElementById("dropzone-file-create");
    if (input) input.value = "";
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
    <div className="mb-5 border-b border-border pb-4">
      <Label className="text-base font-semibold">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );

  const formContent = (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <AppClientStepIndicator currentStep={step} />
      </div>

      <ErrorAlert message={error} onClose={() => setError("")} />

      <FadeWrapper isVisible={step === 1} keyId="app-client-basic-info">
        <div className="space-y-5 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <section>
            {renderSectionHeader("System Logo", "Upload the app client's system logo.", true)}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                fieldErrors.imageFile ? "border-destructive bg-destructive/10" : 
                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {!imagePreview ? (
                <label htmlFor="dropzone-file-create" className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <div className="space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Click to upload</p>
                      <p className="mt-1 text-sm text-muted-foreground">or drag and drop</p>
                      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">PNG or JPG | Max 5MB</p>
                    </div>
                  </div>
                  <input id="dropzone-file-create" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange}/>
                </label>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-xl object-contain shadow-md transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                  <button type="button" onClick={removeImage} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm transition hover:bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {fieldErrors.imageFile && <p className={inlineErrorClassName}>{fieldErrors.imageFile}</p>}
          </section>

          <section>
            <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
            {renderSectionHeader("Client Details", "Enter the app client's name and description.")}
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                {fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}
                {!fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Short description of the application (optional)" />
              </div>
            </div>
          </section>
        </div>
      </FadeWrapper>

      <FadeWrapper isVisible={step === 2} keyId="app-client-urls">
        <div className="space-y-5 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <section>
            <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
            {renderSectionHeader("Application URLs", "Set the base, redirect, logout, and One Portal redirect URLs.")}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Base URL <span className="text-destructive">*</span></Label>
                <Input type="url" required value={baseURL} onChange={(e) => updateFieldValue("baseURL", e.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com" className={fieldErrors.baseURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                {fieldErrors.baseURL && <p className={inlineErrorClassName}>{fieldErrors.baseURL}</p>}
                {!fieldErrors.baseURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label>Redirect URL <span className="text-destructive">*</span></Label>
                <Input type="url" required value={redirectURL} onChange={(e) => updateFieldValue("redirectURL", e.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback" className={fieldErrors.redirectURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                {fieldErrors.redirectURL && <p className={inlineErrorClassName}>{fieldErrors.redirectURL}</p>}
                {!fieldErrors.redirectURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label>Logout URL <span className="text-destructive">*</span></Label>
                <Input type="url" required value={logoutURL} onChange={(e) => updateFieldValue("logoutURL", e.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout" className={fieldErrors.logoutURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                {fieldErrors.logoutURL && <p className={inlineErrorClassName}>{fieldErrors.logoutURL}</p>}
                {!fieldErrors.logoutURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>

              <div className="space-y-2">
                <Label>One Portal Redirect Link</Label>
                <Input type="url" value={onePortalRedirectLink} onChange={(e) => updateFieldValue("onePortalRedirectLink", e.target.value, setOnePortalRedirectLink)} onFocus={() => setActiveVoiceField("onePortalRedirectLink")} placeholder="https://one-portal.example.com" className={fieldErrors.onePortalRedirectLink ? "border-destructive focus-visible:ring-destructive" : ""} />
                {fieldErrors.onePortalRedirectLink && <p className={inlineErrorClassName}>{fieldErrors.onePortalRedirectLink}</p>}
                {!fieldErrors.onePortalRedirectLink && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
              </div>
            </div>
          </section>
        </div>
      </FadeWrapper>

      <FadeWrapper isVisible={step === 3} keyId="app-client-grants">
        <div className="space-y-5 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <section>
            {renderSectionHeader("Grants", "Select the grant types required for this client.", true)}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {GRANT_OPTIONS.map((grant) => {
                const isSelected = grants.includes(grant);
                return (
                  <label key={grant} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition duration-300 cursor-pointer ${isSelected ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted/50"}`}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleGrant(grant)} required={grants.length === 0} />
                    <span className="break-all">{grant}</span>
                  </label>
                );
              })}
            </div>
            {grants.length === 0 && <p className="mt-3 text-xs text-destructive">At least one grant is required.</p>}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Access Token expiration <span className="text-destructive">*</span></Label>
                <div className={`flex overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring ${fieldErrors.accessTokenTTL ? "border-destructive" : "border-input"}`}>
                  <input type="number" required min={TOKEN_TTL_LIMITS.accessToken.min} max={TOKEN_TTL_LIMITS.accessToken.max} value={accessTokenTTL} onChange={(e) => updateFieldValue("accessTokenTTL", e.target.value, setAccessTokenTTL)} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
                  <div className="flex items-center border-l bg-muted px-3 text-sm text-muted-foreground">min</div>
                </div>
                {fieldErrors.accessTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.accessTokenTTL}</p>}
                {!fieldErrors.accessTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1-1,440 minutes (24 hours)</p>}
              </div>

              <div className="space-y-2">
                <Label>Refresh Token expiration <span className="text-destructive">*</span></Label>
                <div className={`flex overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring ${fieldErrors.refreshTokenTTL ? "border-destructive" : "border-input"}`}>
                  <input type="number" required min={TOKEN_TTL_LIMITS.refreshToken.min} max={TOKEN_TTL_LIMITS.refreshToken.max} value={refreshTokenTTL} onChange={(e) => updateFieldValue("refreshTokenTTL", e.target.value, setRefreshTokenTTL)} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
                  <div className="flex items-center border-l bg-muted px-3 text-sm text-muted-foreground">hr</div>
                </div>
                {fieldErrors.refreshTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.refreshTokenTTL}</p>}
                {!fieldErrors.refreshTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1 - 8,760 hours (1 year)</p>}
              </div>
            </div>
          </section>
        </div>
      </FadeWrapper>
    </div>
  );

  const footerActions = (
    <div className="flex flex-col-reverse gap-3 md:mb-12 lg:flex-row lg:justify-end xl:mb-16 [&>button]:w-full lg:[&>button]:w-auto max-w-4xl mx-auto w-full">
      {step === 1 ? (
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
      )}

      {step < 3 ? (
        <Button type="button" onClick={nextStep}>Next</Button>
      ) : (
        <Button type="button" onClick={handleSubmit}>Create Client</Button>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {formContent}
        {footerActions}
      </div>

      {showFullImage && (
        <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
          <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none" hideCloseButton>
            <div className="relative flex items-center justify-center">
              <button type="button" onClick={() => setShowFullImage(false)} className="absolute -right-4 -top-4 rounded-full bg-background p-2 shadow-md hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <img src={imagePreview} className="max-h-[85vh] w-auto rounded-lg object-contain" alt="Full Preview" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
