const fs = require('fs');

const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

const importTarget = `import { Copy, CopyCheck, ChevronRightIcon } from "lucide-react";`;
const importReplacement = `import { Copy, CopyCheck, ChevronRightIcon, Link as LinkIcon } from "lucide-react";`;
content = content.replace(importTarget, importReplacement);

const target1 = `                <Card className="bg-muted/30 border-border/40 shadow-sm">
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
                    <div className="flex-1 max-w-sm mt-2 sm:mt-0 text-sm text-muted-foreground">
                      {description || "No description provided."}
                    </div>
                  </CardContent>
                </Card>`;

const replacement1 = `                <Card className="bg-muted/30 border-border/40 shadow-sm">
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
                )}`;

const target2 = `                        <FramePanel className="space-y-3 p-4">
                          {baseURL && (
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Base URL</span>
                              <a href={baseURL} target="_blank" rel="noreferrer" className="text-sm hover:underline break-all">{baseURL}</a>
                            </div>
                          )}
                          {redirectURL && (
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Redirect URL</span>
                              <span className="text-sm break-all">{redirectURL}</span>
                            </div>
                          )}
                          {logoutURL && (
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Logout URL</span>
                              <span className="text-sm break-all">{logoutURL}</span>
                            </div>
                          )}
                          {onePortalRedirectLink && (
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">One Portal Redirect Link</span>
                              <span className="text-sm break-all">{onePortalRedirectLink}</span>
                            </div>
                          )}
                          {!baseURL && !redirectURL && !logoutURL && !onePortalRedirectLink && (
                            <span className="text-sm text-muted-foreground">No links provided.</span>
                          )}
                        </FramePanel>`;

const replacement2 = `                        <FramePanel className="space-y-4 p-4">
                          <div className="flex gap-3">
                            <LinkIcon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Base URL</span>
                              {baseURL ? (
                                <a href={baseURL} target="_blank" rel="noreferrer" className="text-sm hover:underline break-all">{baseURL}</a>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not provided</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <LinkIcon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Redirect URL</span>
                              {redirectURL ? (
                                <span className="text-sm break-all">{redirectURL}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not provided</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <LinkIcon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Logout URL</span>
                              {logoutURL ? (
                                <span className="text-sm break-all">{logoutURL}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not provided</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <LinkIcon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                            <div>
                              <span className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">One Portal Redirect Link</span>
                              {onePortalRedirectLink ? (
                                <span className="text-sm break-all">{onePortalRedirectLink}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground"></span>
                              )}
                            </div>
                          </div>
                        </FramePanel>`;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replacement1);
  content = content.replace(target2, replacement2);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.error('Target not found');
}
