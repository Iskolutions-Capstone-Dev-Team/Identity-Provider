import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
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
import { useAppClientModal } from "../hooks/useAppClientModal";
import { TOKEN_TTL_LIMITS, GRANT_OPTIONS } from "../hooks/useAppClientCreateForm";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const inlineErrorClassName = "!mt-0 text-xs text-destructive";

export default function AppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit, colorMode = "light" }) {
  const modalState = useAppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit });

  const {
    isView,
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
    selectedGrants,
    accessTokenTTL,
    setAccessTokenTTL,
    refreshTokenTTL,
    setRefreshTokenTTL,
    imagePreview,
    setActiveVoiceField,
    error,
    setError,
    fieldErrors,
    isDetailsLoading,
    isCopied,
    activeVoiceFieldLabel,
    handleCopyId,
    updateFieldValue,
    handleVoiceInput,
    toggleGrant,
    handleLogoChange,
    handleSubmit,
  } = modalState;

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
        <DialogContent className="sm:max-w-3xl" closeButtonClassName="text-white hover:text-white hover:bg-white/20 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground">
          <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
            <DialogTitle>
              {isView ? "View App Client" : "Edit App Client"}
            </DialogTitle>
          </DialogHeader>

          <form id="app-client-form" noValidate className="-mx-4 no-scrollbar max-h-[70vh] px-4 overflow-y-auto pt-3" onSubmit={handleSubmit}>

            {isDetailsLoading && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                Loading latest app client details...
              </div>
            )}

            {isView ? (
              <div className="space-y-6 pt-3 pb-4 px-2">
                <Card className="bg-muted/30 border-border/40 shadow-sm">
                  <CardContent className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-16">
                        <AvatarImage src={imagePreview} alt={name || "App Client Logo"} />
                        <AvatarFallback className="bg-[#7b0d15] text-[#f8d24e] dark:bg-[#f8d24e] dark:text-[#7b0d15] font-medium">{name ? name.substring(0, 2).toUpperCase() : "AC"}</AvatarFallback>
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
              <div className="space-y-6 pt-3 pb-4 px-2">
                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-5">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">System Logo {!isView && <span className="text-red-500">*</span>}</h4>
                      <p className="text-sm text-muted-foreground">Update the client's system logo.</p>
                    </div>
                    <Separator />
                    <Field className="space-y-2">
                      <AppClientLogoUpload
                        onFilesChange={handleLogoChange}
                        maxFiles={1}
                        maxSize={MAX_LOGO_BYTES}
                        accept="image/png, image/jpeg"
                        simulateUpload={true}
                        initialPreview={imagePreview}
                      />
                      {fieldErrors.imageFile && <p className={inlineErrorClassName}>{fieldErrors.imageFile}</p>}
                    </Field>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-5">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Client Details</h4>
                      <p className="text-sm text-muted-foreground">Update the client's name and description.</p>
                    </div>
                    <Separator />
                    {!isView && (
                      <SpeechInputToolbar activeFieldLabel={activeVoiceFieldLabel} onError={setError} onTranscript={handleVoiceInput} colorMode={colorMode} />
                    )}

                    <div className="space-y-2">
                      <Label>Name {!isView && <span className="text-destructive">*</span>}</Label>
                      <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" disabled={isView} spellCheck={false} className="h-10 rounded-lg" />
                      {!isView && fieldErrors.name && <p className={inlineErrorClassName.replace('mt-2', 'mt-1')}>{fieldErrors.name}</p>}
                      {!isView && !fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        Description
                        <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-medium border-[#7b0d15]/40 text-[#7b0d15] dark:border-[#f8d24e]/40 dark:text-[#f8d24e]">Optional</span>
                      </Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={() => setActiveVoiceField("description")}
                        rows="4"
                        placeholder={isView ? "" : "Short description of the application"}
                        className="rounded-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-muted/50 disabled:text-muted-foreground disabled:border-input"
                        disabled={isView}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm uppercase">Application URLs</h4>
                      <p className="text-sm text-muted-foreground">Update the base, redirect, logout, and One Portal redirect URLs.</p>
                    </div>
                    <Separator />
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Base URLs {!isView && <span className="text-destructive">*</span>}</Label>
                        <Input type="url" required value={baseURL} onChange={(e) => updateFieldValue("baseURL", e.target.value, setBaseURL)} onFocus={() => setActiveVoiceField("baseURL")} placeholder="https://app.example.com" disabled={isView} className="h-10 rounded-lg" />
                        {!isView && fieldErrors.baseURL && <p className={inlineErrorClassName}>{fieldErrors.baseURL}</p>}
                        {!isView && !fieldErrors.baseURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Redirect URLs {!isView && <span className="text-destructive">*</span>}</Label>
                        <Input type="url" required value={redirectURL} onChange={(e) => updateFieldValue("redirectURL", e.target.value, setRedirectURL)} onFocus={() => setActiveVoiceField("redirectURL")} placeholder="https://app.example.com/callback" disabled={isView} className="h-10 rounded-lg" />
                        {!isView && fieldErrors.redirectURL && <p className={inlineErrorClassName}>{fieldErrors.redirectURL}</p>}
                        {!isView && !fieldErrors.redirectURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Logout URLs {!isView && <span className="text-destructive">*</span>}</Label>
                        <Input type="url" required value={logoutURL} onChange={(e) => updateFieldValue("logoutURL", e.target.value, setLogoutURL)} onFocus={() => setActiveVoiceField("logoutURL")} placeholder="https://app.example.com/logout" disabled={isView} className="h-10 rounded-lg" />
                        {!isView && fieldErrors.logoutURL && <p className={inlineErrorClassName}>{fieldErrors.logoutURL}</p>}
                        {!isView && !fieldErrors.logoutURL && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center justify-between">
                          One Portal Redirect Link
                          <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-medium border-[#7b0d15]/40 text-[#7b0d15] dark:border-[#f8d24e]/40 dark:text-[#f8d24e]">Optional</span>
                        </Label>
                        <Input type="url" value={onePortalRedirectLink} onChange={(e) => updateFieldValue("onePortalRedirectLink", e.target.value, setOnePortalRedirectLink)} onFocus={() => setActiveVoiceField("onePortalRedirectLink")} placeholder={isView ? "" : "https://one-portal.example.com"} disabled={isView} className="h-10 rounded-lg" />
                        {!isView && fieldErrors.onePortalRedirectLink && <p className={inlineErrorClassName}>{fieldErrors.onePortalRedirectLink}</p>}
                        {!isView && !fieldErrors.onePortalRedirectLink && <p className="text-xs text-muted-foreground">Must be valid URL</p>}
                      </div>
                    </div>

                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border/40">
                  <CardContent className="px-5 py-0 space-y-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm uppercase">Grants {!isView && <span className="text-red-500">*</span>}</h4>
                        <p className="text-sm text-muted-foreground">Select the grant types required for this client.</p>
                      </div>
                      <Separator />
                      <Field className="space-y-2">
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
                                    className="absolute -top-2 -right-2 size-5 rounded-full border bg-background shadow-sm z-10 data-checked:!bg-[#7b0d15] data-checked:!border-[#7b0d15] data-checked:!text-white dark:data-checked:!bg-[#f8d24e] dark:data-checked:!border-[#f8d24e] dark:data-checked:!text-black"
                                  />
                                  <FieldTitle className="justify-center text-center">{formatGrantName(grant)}</FieldTitle>
                                </Field>
                              </FieldLabel>
                            );
                          })}
                        </FieldGroup>
                        {!isView && selectedGrants.length === 0 && <p className="!mt-0 text-xs text-destructive">At least one grant is required.</p>}
                      </Field>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm uppercase">Token Expiration {!isView && <span className="text-red-500">*</span>}</h4>
                        <p className="text-sm text-muted-foreground">Update the token expiration values for this client.</p>
                      </div>
                      <Separator />
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Access Token expiration {!isView && <span className="text-destructive">*</span>}</Label>
                          <InputGroup className="h-10 rounded-lg">
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
                          <InputGroup className="h-10 rounded-lg">
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
                  </CardContent>
                </Card>
              </div>
            )}
          </form>

          <DialogFooter className="flex-row items-center justify-between gap-2 mt-2">
            <div className="flex gap-2 ml-auto justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {isView ? "Close" : "Cancel"}
              </Button>
              {!isView && (
                <Button type="submit" form="app-client-form" disabled={isDetailsLoading} className="bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] font-bold transition-colors duration-200">
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
