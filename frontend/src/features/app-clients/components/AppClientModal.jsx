import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ErrorAlert from "../../../components/ErrorAlert";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import AppClientIconBox from "./AppClientIconBox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AppClientLogoUpload } from "./AppClientLogoUpload";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, CopyCheck, ChevronRightIcon, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldGroup, FieldTitle } from "@/components/ui/field";
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
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const detailsRequestRef = useRef({ clientId: "", inFlight: false });

  const handleCopyId = () => {
    const idToCopy = client?.id || client?.clientId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setIsCopied(true);
      toast.success("Client ID copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

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

  const handleLogoChange = (file) => {
    setImageFile(file);
    if (file) {
      clearFieldError("imageFile");
      setError("");
    } else {
      // User removed the image
      setImageLocation("");
    }
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
        <DialogContent className="sm:max-w-3xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
          <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[#7b0d15] text-white dark:bg-transparent dark:text-foreground">
            <DialogTitle>
              {isView ? "View App Client" : "Edit App Client"}
            </DialogTitle>
          </DialogHeader>

          <form id="app-client-form" noValidate className="-mx-4 no-scrollbar max-h-[70vh] px-4 overflow-y-auto" onSubmit={handleSubmit}>
            {error && <div className="mb-6"><ErrorAlert message={error} onClose={() => setError("")} /></div>}

            {isDetailsLoading && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                Loading latest app client details...
              </div>
            )}

            {isView ? (
              <div className="space-y-6 pt-0 pb-4 px-2 mt-4">
                <Card className="bg-muted/30 border-border/40 shadow-sm">
                  <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-16">
                        <AvatarImage src={imagePreview} alt={name || "App Client Logo"} />
                        <AvatarFallback>{name ? name.substring(0, 2).toUpperCase() : "AC"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {name || "Unnamed Client"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <p className="text-sm text-muted-foreground font-mono">
                            ID: {client?.id || client?.clientId || ""}
                          </p>
                          <Button size="icon-sm" variant="ghost" aria-label="Copy ID" onClick={handleCopyId}>
                            {isCopied ? <CopyCheck aria-hidden="true" className="text-[#00d053]" /> : <Copy aria-hidden="true" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {description && (
                  <Card className="bg-muted/30 border-border/40 shadow-sm">
                    <CardContent className="px-5 py-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="w-full">
                  <Frame stacked dense spacing="sm" className="w-full">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex w-full group">
                        <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
                          <FrameTitle className="text-sm font-medium">
                            Links
                          </FrameTitle>
                          <ChevronRightIcon aria-hidden="true" className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-90 group-data-[panel-open]:rotate-90 group-data-[open]:rotate-90" />
                        </FrameHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <FramePanel className="space-y-3 p-4">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Base URL</span>
                            {baseURL ? (
                              <a href={baseURL} target="_blank" rel="noreferrer" className="text-sm hover:underline break-all">{baseURL}</a>
                            ) : (
                              <span className="text-sm text-muted-foreground"></span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Redirect URL</span>
                            {redirectURL ? (
                              <span className="text-sm break-all">{redirectURL}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground"></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Logout URL</span>
                            {logoutURL ? (
                              <span className="text-sm break-all">{logoutURL}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground"></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">One Portal Link</span>
                            {onePortalRedirectLink ? (
                              <span className="text-sm break-all">{onePortalRedirectLink}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground"></span>
                            )}
                          </div>
                        </FramePanel>
                      </CollapsibleContent>
                    </Collapsible>
                  </Frame>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/30 border-border/40 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Grants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedGrants.map(g => <Badge key={g} className="bg-[#7b0d15]/10 border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 font-semibold rounded-md px-3 py-1">{g}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30 border-border/40 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Token Expiration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Access Token:</span>
                        <span>{accessTokenTTL} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refresh Token:</span>
                        <span>{refreshTokenTTL} hours</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                {renderSectionHeader("System Logo", isView ? "View the app client's system logo." : "Update the app client's system logo.", !isView)}
                
                {isView ? (
                  <div className="flex justify-center p-4 rounded-xl border border-border bg-muted/30">
                    {imagePreview ? (
                      <img src={imagePreview} alt="System Logo" className="max-h-52 max-w-full rounded-xl object-contain shadow-sm" />
                    ) : (
                      <div className="flex h-32 w-full flex-col items-center justify-center text-muted-foreground">
                        <AppClientIconBox colorMode={colorMode} variant="plain" className="mb-2 opacity-50" />
                        <span className="text-sm">No logo available</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <AppClientLogoUpload 
                      onFilesChange={handleLogoChange}
                      maxFiles={1}
                      maxSize={MAX_LOGO_BYTES}
                      accept="image/png, image/jpeg"
                      simulateUpload={true}
                      initialPreview={imagePreview}
                    />
                    {fieldErrors.imageFile && <p className={inlineErrorClassName}>{fieldErrors.imageFile}</p>}
                  </>
                )}
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
                    <Field className="space-y-2">
                      <FieldLabel>Grants {!isView && <span className="text-destructive">*</span>}</FieldLabel>
                      <FieldGroup className="flex w-full flex-row flex-wrap gap-4">
                        {GRANT_OPTIONS.map((grant) => {
                          const isSelected = selectedGrants.includes(grant);
                          const formatGrantName = (name) => name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                          
                          return (
                            <FieldLabel key={grant} className="relative p-0 !w-auto flex-1 min-w-fit" style={{ pointerEvents: isView ? "none" : "auto" }}>
                              <Field orientation="horizontal" className="justify-center">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => !isView && toggleGrant(grant)}
                                  disabled={isView}
                                  className="absolute -top-2 -right-2 size-5 rounded-full border-none shadow-none z-10"
                                />
                                <FieldTitle className="justify-center text-center">{formatGrantName(grant)}</FieldTitle>
                              </Field>
                            </FieldLabel>
                          );
                        })}
                      </FieldGroup>
                      {!isView && selectedGrants.length === 0 && <p className="mt-3 text-xs text-destructive">At least one grant is required.</p>}
                    </Field>
                  </div>

                  <div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Access Token expiration {!isView && <span className="text-destructive">*</span>}</Label>
                        <InputGroup className={`h-10 rounded-lg ${fieldErrors.accessTokenTTL ? "border-destructive focus-within:border-destructive focus-within:ring-destructive" : ""}`}>
                          <InputGroupInput type="number" required={!isView} min={TOKEN_TTL_LIMITS.accessToken.min} max={TOKEN_TTL_LIMITS.accessToken.max} value={accessTokenTTL} onChange={(e) => updateFieldValue("accessTokenTTL", e.target.value, setAccessTokenTTL)} disabled={isView} />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>min</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        {!isView && fieldErrors.accessTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.accessTokenTTL}</p>}
                        {!isView && !fieldErrors.accessTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1-1,440 minutes (24 hours)</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Refresh Token expiration {!isView && <span className="text-destructive">*</span>}</Label>
                        <InputGroup className={`h-10 rounded-lg ${fieldErrors.refreshTokenTTL ? "border-destructive focus-within:border-destructive focus-within:ring-destructive" : ""}`}>
                          <InputGroupInput type="number" required={!isView} min={TOKEN_TTL_LIMITS.refreshToken.min} max={TOKEN_TTL_LIMITS.refreshToken.max} value={refreshTokenTTL} onChange={(e) => updateFieldValue("refreshTokenTTL", e.target.value, setRefreshTokenTTL)} disabled={isView} />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>hr</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        {!isView && fieldErrors.refreshTokenTTL && <p className={inlineErrorClassName}>{fieldErrors.refreshTokenTTL}</p>}
                        {!isView && !fieldErrors.refreshTokenTTL && <p className="text-xs text-muted-foreground">Valid range: 1 - 8,760 hours (1 year)</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              </div>
            )}
          </form>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {isView ? "Close" : "Cancel"}
              </Button>
              {!isView && (
                <Button type="submit" form="app-client-form" disabled={isDetailsLoading}>
                  {mode === "create" ? "Create" : "Save"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
