const fs = require('fs');

const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

const target2 = `                        <FramePanel className="space-y-4 p-4">
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

const replacement2 = `                        <FramePanel className="space-y-3 p-4">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Base URL</span>
                            {baseURL ? (
                              <a href={baseURL} target="_blank" rel="noreferrer" className="text-sm hover:underline break-all">{baseURL}</a>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not provided</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Redirect URL</span>
                            {redirectURL ? (
                              <span className="text-sm break-all">{redirectURL}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not provided</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">Logout URL</span>
                            {logoutURL ? (
                              <span className="text-sm break-all">{logoutURL}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not provided</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]">One Portal Link</span>
                            {onePortalRedirectLink ? (
                              <span className="text-sm break-all">{onePortalRedirectLink}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not provided</span>
                            )}
                          </div>
                        </FramePanel>`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.error('Target not found');
}
