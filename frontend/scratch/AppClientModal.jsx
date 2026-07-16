import { useEffect, useRef, useState } from "react";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import AppClientIconBox from "./AppClientIconBox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const GRANT_OPTIONS = [
  "authorization_code",
  "refresh_token",
  "client_credentials",
];
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

const getOnePortalRedirectLink = (client = {}) =>
  client.one_portal_link ?? client.one_portal_redirect_link ?? "";

const getTokenTTLValue = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? String(parsedValue) : fallbackValue;
};

const parseTokenTTL = (value) => Number.parseInt(value, 10);

const isValidTokenTTL = (value, { min, max }) =>
  Number.isInteger(value) && value >= min && value <= max;

const resolveImageSrc = (image) => {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${image}`;
};

export default function AppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit, colorMode = "light" }) {
  const isView = mode === "view";
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [onePortalRedirectLink, setOnePortalRedirectLink] = useState("");
  const [selectedGrants, setSelectedGrants] = useState(["authorization_code"]);
  const [accessTokenTTL, setAccessTokenTTL] = useState(TOKEN_TTL_LIMITS.accessToken.defaultValue);
  const [refreshTokenTTL, setRefreshTokenTTL] = useState(TOKEN_TTL_LIMITS.refreshToken.defaultValue);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const detailsRequestRef = useRef({ clientId: "", inFlight: false });

  useEffect(() => {
    if (!open) {
      detailsRequestRef.current = { clientId: "", inFlight: false };
      setActiveVoiceField("name");
      setFieldErrors(initialFieldErrors);
      return;
    }

    if (!client) return;

    setName(client.name || "");
    setDescription(client.description || "");
    setBaseURL(client.base_url || "");
    setRedirectURL(client.redirect_uri || "");
    setLogoutURL(client.logout_uri || "");
    setOnePortalRedirectLink(getOnePortalRedirectLink(client));
    setSelectedGrants(client.grants || ["authorization_code"]);
    setAccessTokenTTL(getTokenTTLValue(client.access_token_ttl, TOKEN_TTL_LIMITS.accessToken.defaultValue));
    setRefreshTokenTTL(getTokenTTLValue(client.refresh_token_ttl, TOKEN_TTL_LIMITS.refreshToken.defaultValue));
    setImageFile(null);
    setIsDragging(false);
    setActiveVoiceField("name");
    setError("");
    setFieldErrors(initialFieldErrors);

    const image = client.image || client.image_location || null;
    setImageLocation(image || "");
    setImagePreview(resolveImageSrc(image));
  }, [client, open]);

  useEffect(() => {
    if (!open || !client || typeof getClientDetails !== "function") return;

    const clientId = client.id || client.clientId;
    if (!clientId) return;
    if (detailsRequestRef.current.inFlight && detailsRequestRef.current.clientId === clientId) {
      return;
    }

    let cancelled = false;
    detailsRequestRef.current = { clientId, inFlight: true };
    setIsDetailsLoading(true);
    setError("");

    getClientDetails(clientId)
      .then((details) => {
        if (cancelled || !details) return;

        setName(details.name || "");
        setDescription(details.description || "");
        setBaseURL(details.base_url || "");
        setRedirectURL(details.redirect_uri || "");
        setLogoutURL(details.logout_uri || "");
        setOnePortalRedirectLink(getOnePortalRedirectLink(details));
        setSelectedGrants(details.grants || ["authorization_code"]);
        setAccessTokenTTL(getTokenTTLValue(details.access_token_ttl, TOKEN_TTL_LIMITS.accessToken.defaultValue));
        setRefreshTokenTTL(getTokenTTLValue(details.refresh_token_ttl, TOKEN_TTL_LIMITS.refreshToken.defaultValue));
        setFieldErrors(initialFieldErrors);

        const image = details.image || details.image_location || null;
        setImageLocation(image || "");
        setImagePreview(resolveImageSrc(image));
      })
      .catch((fetchError) => {
        if (cancelled) return;
        console.error("Fetch client details error:", fetchError);
        setError("Unable to load latest app client details.");
      })
      .finally(() => {
        detailsRequestRef.current = { clientId, inFlight: false };
        if (!cancelled) {
          setIsDetailsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, getClientDetails, open]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) => current[fieldName] ? { ...current, [fieldName]: "" } : current);
  };

  const updateFieldValue = (fieldName, value, setter) => {
    setter(value);
    clearFieldError(fieldName);
    if (error) setError("");
  };

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

  const validateEditableFields = () => {
    const trimmedName = name.trim();
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const trimmedOnePortalRedirectLink = onePortalRedirectLink.trim();
    const nextFieldErrors = { ...initialFieldErrors };
    const hasLogo = Boolean(imageFile) || Boolean(imageLocation);

    if (!hasLogo) nextFieldErrors.imageFile = "System logo is required.";
    if (!trimmedName) nextFieldErrors.name = "Client name is required.";
    else if (trimmedName.length < 5 || trimmedName.length > 100) nextFieldErrors.name = "Client name must be between 5 and 100 characters.";
    
    if (!trimmedBaseURL) nextFieldErrors.baseURL = "Base URL is required.";
    else if (!isValidHttpUrl(trimmedBaseURL)) nextFieldErrors.baseURL = "Base URL must be a valid URL.";

    if (!trimmedRedirectURL) nextFieldErrors.redirectURL = "Redirect URL is required.";
    else if (!isValidHttpUrl(trimmedRedirectURL)) nextFieldErrors.redirectURL = "Redirect URL must be a valid URL.";

    if (!trimmedLogoutURL) nextFieldErrors.logoutURL = "Logout URL is required.";
    else if (!isValidHttpUrl(trimmedLogoutURL)) nextFieldErrors.logoutURL = "Logout URL must be a valid URL.";

    if (trimmedOnePortalRedirectLink && !isValidHttpUrl(trimmedOnePortalRedirectLink)) {
      nextFieldErrors.onePortalRedirectLink = "One Portal Redirect Link must be a valid URL.";
    }

    if (!isValidTokenTTL(parseTokenTTL(accessTokenTTL), TOKEN_TTL_LIMITS.accessToken)) {
      nextFieldErrors.accessTokenTTL = "Expiration must be between 1 and 1,440 minutes.";
    }

    if (!isValidTokenTTL(parseTokenTTL(refreshTokenTTL), TOKEN_TTL_LIMITS.refreshToken)) {
      nextFieldErrors.refreshTokenTTL = "Expiration must be between 1 and 8,760 hours.";
    }

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(err => err);
    if (firstError) {
      setError(firstError);
      return false;
    }
    return true;
  };

  const toggleGrant = (grant) => {
    if (selectedGrants.includes(grant)) {
      setSelectedGrants(selectedGrants.filter((value) => value !== grant));
    } else {
      setSelectedGrants([...selectedGrants, grant]);
    }
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
  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isView) setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isView) validateAndProcessFile(event.dataTransfer.files?.[0]);
  };
  const removeImage = (event) => {
    event.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    setImageLocation("");
    clearFieldError("imageFile");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isView) return onClose();

    if (!validateEditableFields()) return;

    if (!selectedGrants || selectedGrants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        id: client?.id || client?.clientId,
        name,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        one_portal_redirect_link: onePortalRedirectLink,
        grants: selectedGrants,
        access_token_ttl: parseTokenTTL(accessTokenTTL),
        refresh_token_ttl: parseTokenTTL(refreshTokenTTL),
        imageFile,
      });

      onClose();
    } catch (submitError) {
      console.error("Submit app client error:", submitError);
      setError(submitError?.message || "Unable to save app client. Please review the details and try again.");
    }
  };

  const voiceFieldLabels = {
    description: "Description", baseURL: "Base URL", redirectURL: "Redirect URL",
    logoutURL: "Logout URL", onePortalRedirectLink: "One Portal Redirect Link",
  };
  const activeVoiceFieldLabel = voiceFieldLabels[activeVoiceField] || "Name";

  const renderSectionHeader = (title, description, isRequired = false) => (
    <div className="mb-5 border-b border-border pb-4">
      <Label className="text-base font-semibold">
        {title} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      <p className="text-sm text-muted-foreground mt-1">
        {description}
      </p>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card text-card-foreground border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-4">
              <AppClientIconBox colorMode={colorMode} variant="plain" />
              <DialogTitle className="text-xl">
                {isView ? "View App Client" : "Edit App Client"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form id="app-client-form" noValidate className="p-6 overflow-y-auto max-h-[70vh]" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <ErrorAlert message={error} onClose={() => setError("")} />

              {isDetailsLoading && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                  Loading latest app client details...
                </div>
              )}

              <section>
                {renderSectionHeader("System Logo", isView ? "View the app client's system logo." : "Update the app client's system logo.", !isView)}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                    fieldErrors.imageFile && !isView ? "border-destructive bg-destructive/10" : 
                    isDragging && !isView ? "border-primary bg-primary/10" : 
                    isView ? "border-muted" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {!imagePreview ? (
                    <label htmlFor="dropzone-file" className={`flex h-full w-full flex-col items-center justify-center ${isView ? "cursor-default" : "cursor-pointer"}`}>
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
                      <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={isView}/>
                    </label>
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-xl object-contain shadow-md transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                      {!isView && (
                        <button type="button" onClick={removeImage} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm transition hover:bg-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {!isView && fieldErrors.imageFile && <p className={inlineErrorClassName}>{fieldErrors.imageFile}</p>}
              </section>

              <section>
                {renderSectionHeader("Client Details", isView ? "View the app client's basic details." : "Update the app client's name and description.")}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Client Id</Label>
                    <Input value={client?.id || client?.clientId || ""} readOnly disabled className="bg-muted"/>
                  </div>

                  {!isView && (
                    <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
                  )}

                  <div className="space-y-2">
                    <Label>Name {!isView && <span className="text-destructive">*</span>}</Label>
                    <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" disabled={isView} className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {!isView && fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}
                    {!isView && !fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    {isView ? (
                      <div className="min-h-24 w-full rounded-md border bg-muted px-3 py-2 text-sm">
                        {description?.trim() || ""}
                      </div>
                    ) : (
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Application description" />
                    )}
                  </div>
                </div>
              </section>

              <section>
                {renderSectionHeader("Application URLs", isView ? "View the configured application URLs." : "Update the base, redirect, logout, and One Portal redirect URLs.")}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Base URLs {!isView && <span className="text-destructive">*</span>}</Label>
                    <Input type="url" required value={baseURL} onChange={(e) => updateFieldValue("baseURL", e.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com" disabled={isView} className={fieldErrors.baseURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {!isView && fieldErrors.baseURL && <p className={inlineErrorClassName}>{fieldErrors.baseURL}</p>}
                    {!isView && !fieldErrors.baseURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Redirect URLs {!isView && <span className="text-destructive">*</span>}</Label>
                    <Input type="url" required value={redirectURL} onChange={(e) => updateFieldValue("redirectURL", e.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback" disabled={isView} className={fieldErrors.redirectURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {!isView && fieldErrors.redirectURL && <p className={inlineErrorClassName}>{fieldErrors.redirectURL}</p>}
                    {!isView && !fieldErrors.redirectURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Logout URLs {!isView && <span className="text-destructive">*</span>}</Label>
                    <Input type="url" required value={logoutURL} onChange={(e) => updateFieldValue("logoutURL", e.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout" disabled={isView} className={fieldErrors.logoutURL ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {!isView && fieldErrors.logoutURL && <p className={inlineErrorClassName}>{fieldErrors.logoutURL}</p>}
                    {!isView && !fieldErrors.logoutURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>One Portal Redirect Link</Label>
                    <Input type="url" value={onePortalRedirectLink} onChange={(e) => updateFieldValue("onePortalRedirectLink", e.target.value, setOnePortalRedirectLink)} onFocus={() => setActiveVoiceField("onePortalRedirectLink")} placeholder={isView ? "" : "https://one-portal.example.com"} disabled={isView} className={fieldErrors.onePortalRedirectLink ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {!isView && fieldErrors.onePortalRedirectLink && <p className={inlineErrorClassName}>{fieldErrors.onePortalRedirectLink}</p>}
                    {!isView && !fieldErrors.onePortalRedirectLink && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                  </div>
                </div>
              </section>

              <section>
                <div className="space-y-5">
                  <div>
                    {renderSectionHeader("Grants", isView ? "View the grant types enabled for this client." : "Select the grant types required for this client.", !isView)}
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {GRANT_OPTIONS.map((grant) => {
                        const isSelected = selectedGrants.includes(grant);
                        return (
                          <label key={grant} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition duration-300 ${isSelected ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted/50"} ${isView ? "cursor-default" : "cursor-pointer"}`}>
                            <Checkbox checked={isSelected} onCheckedChange={() => !isView && toggleGrant(grant)} disabled={isView} required={!isView && selectedGrants.length === 0} />
                            <span className="break-all">{grant}</span>
                          </label>
                        );
                      })}
                    </div>
                    {!isView && selectedGrants.length === 0 && <p className="mt-3 text-xs text-destructive">At least one grant is required.</p>}
                  </div>

                  <div>
                    {renderSectionHeader("Token Expiration", isView ? "View the configured token expiration values." : "Update the token expiration values for this client.", !isView)}
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Access Token expiration {!isView && <span className="text-destructive">*</span>}</Label>
                        <div className={`flex overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring ${fieldErrors.accessTokenTTL ? "border-destructive" : "border-input"}`}>
                          <input type="number" required={!isView} min={TOKEN_TTL_LIMITS.accessToken.min} max={TOKEN_TTL_LIMITS.accessToken.max} value={accessTokenTTL} onChange={(e) => updateFieldValue("accessTokenTTL", e.target.value, setAccessTokenTTL)} disabled={isView} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50" />
                          <div className="flex items-center border-l bg-muted px-3 text-sm text-muted-foreground">min</div>
                        </div>
                        {!isView && fieldErrors.accessTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.accessTokenTTL}</p>}
                        {!isView && !fieldErrors.accessTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1-1,440 minutes (24 hours)</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Refresh Token expiration {!isView && <span className="text-destructive">*</span>}</Label>
                        <div className={`flex overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring ${fieldErrors.refreshTokenTTL ? "border-destructive" : "border-input"}`}>
                          <input type="number" required={!isView} min={TOKEN_TTL_LIMITS.refreshToken.min} max={TOKEN_TTL_LIMITS.refreshToken.max} value={refreshTokenTTL} onChange={(e) => updateFieldValue("refreshTokenTTL", e.target.value, setRefreshTokenTTL)} disabled={isView} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50" />
                          <div className="flex items-center border-l bg-muted px-3 text-sm text-muted-foreground">hr</div>
                        </div>
                        {!isView && fieldErrors.refreshTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.refreshTokenTTL}</p>}
                        {!isView && !fieldErrors.refreshTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1 - 8,760 hours (1 year)</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </form>

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50">
            <Button type="button" variant="outline" onClick={onClose}>
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView && (
              <Button type="submit" form="app-client-form" disabled={isDetailsLoading}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
