const fs = require('fs');

const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

const target1 = `            <div className="space-y-8">
              <ErrorAlert message={error} onClose={() => setError("")} />

              {isDetailsLoading && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                  Loading latest app client details...
                </div>
              )}

              <section>`;

const replacement1 = `            {error && <div className="mb-6"><ErrorAlert message={error} onClose={() => setError("")} /></div>}

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
                    <div className="flex-1 max-w-sm mt-2 sm:mt-0 text-sm text-muted-foreground">
                      {description || "No description provided."}
                    </div>
                  </CardContent>
                </Card>

                <div className="w-full">
                  <Frame stacked dense spacing="sm" className="w-full">
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex w-full group">
                        <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
                          <FrameTitle className="text-sm font-medium">
                            Links
                          </FrameTitle>
                          <ChevronRightIcon aria-hidden="true" className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-90" />
                        </FrameHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <FramePanel className="space-y-3 p-4">
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
                        {selectedGrants.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
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
                <section>`;

const target2 = `              </section>
            </div>
          </form>`;

const replacement2 = `              </section>
              </div>
            )}
          </form>`;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replacement1);
  content = content.replace(target2, replacement2);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.error('Target not found');
}
