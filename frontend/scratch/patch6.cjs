const fs = require('fs');
const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add imports for Field and FieldLabel
if (!content.includes('import { Field, FieldLabel }')) {
  content = content.replace(
    'import { Input } from "@/components/ui/input";',
    'import { Input } from "@/components/ui/input";\nimport { Field, FieldLabel } from "@/components/ui/field";'
  );
}

// 2. Update renderSectionHeader to remove border-b pb-4
content = content.replace(
  '<div className="mb-5 border-b border-border pb-4">',
  '<div className="mb-5">'
);

// 3. Update Client Details section header and remove Client Id
content = content.replace(
  '{renderSectionHeader("Client Details", isView ? "View the app client\'s basic details." : "Update the app client\'s name and description.")}',
  '{renderSectionHeader("Name and description", isView ? "View the app client\'s name and description." : "Update the app client\'s name and description.")}'
);

const clientIdRegex = /<div className="space-y-2">\s*<Label>Client Id<\/Label>\s*<Input value={client\?\.id \|\| client\?\.clientId \|\| ""} readOnly disabled className="bg-muted"\/>\s*<\/div>/;
content = content.replace(clientIdRegex, '');

// 4. Update Name field
content = content.replace(
  '<div className="space-y-2">\n                    <Label>Name {!isView && <span className="text-destructive">*</span>}</Label>\n                    <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" disabled={isView} className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""} />\n                    {!isView && fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}\n                    {!isView && !fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}\n                  </div>',
  `<Field className="space-y-2">
                    <FieldLabel>Name {!isView && <span className="text-destructive">*</span>}</FieldLabel>
                    <Input required minLength={5} maxLength={100} value={name} onChange={(e) => updateFieldValue("name", e.target.value, setName)} onFocus={() => setActiveVoiceField("name")} placeholder="(e.g., Identity Provider System)" disabled={isView} className={\`h-10 rounded-lg \${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}\`} />
                    {!isView && fieldErrors.name && <p className={inlineErrorClassName}>{fieldErrors.name}</p>}
                    {!isView && !fieldErrors.name && <p className="text-xs text-muted-foreground">Must be 5-100 characters</p>}
                  </Field>`
);

// 5. Update Description field
content = content.replace(
  '<div className="space-y-2">\n                    <Label>Description</Label>\n                    {isView ? (\n                      <div className="min-h-24 w-full rounded-md border bg-muted px-3 py-2 text-sm">\n                        {description?.trim() || ""}\n                      </div>\n                    ) : (\n                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Application description" />\n                    )}\n                  </div>',
  `<Field className="space-y-2">
                    <FieldLabel>Description</FieldLabel>
                    {isView ? (
                      <div className="min-h-24 w-full rounded-lg border bg-muted px-3 py-2 text-sm">
                        {description?.trim() || ""}
                      </div>
                    ) : (
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setActiveVoiceField("description")} rows="3" placeholder="Application description" className="rounded-lg" />
                    )}
                  </Field>`
);

// 6. Update URL fields
const urlFields = [
  { label: 'Base URLs', state: 'baseURL', placeholder: 'https://app.example.com' },
  { label: 'Redirect URLs', state: 'redirectURL', placeholder: 'https://app.example.com/callback' },
  { label: 'Logout URLs', state: 'logoutURL', placeholder: 'https://app.example.com/logout' }
];

for (const field of urlFields) {
  const regex = new RegExp(
    `<div className="space-y-2">\\s*<Label>${field.label} {!isView && <span className="text-destructive">\\*<\\/span>}<\\/Label>\\s*<Input type="url" required value={${field.state}} onChange={\\(e\\) => updateFieldValue\\("${field.state}", e\\.target\\.value, set[a-zA-Z]+\\)} onFocus={\\(\\) => setActiveVoiceField\\("${field.state}"\\)} placeholder="${field.placeholder}" disabled={isView} className={fieldErrors\\.${field.state} \\? "border-destructive focus-visible:ring-destructive" : ""} \\/>\\s*{!isView && fieldErrors\\.${field.state} && <p className={inlineErrorClassName}>{fieldErrors\\.${field.state}}<\\/p>}\\s*{!isView && !fieldErrors\\.${field.state} && <p className="text-xs text-muted-foreground">Must be valid URL<\\/p>}\\s*<\\/div>`
  );
  
  content = content.replace(regex, (match) => {
    return match.replace(/<div className="space-y-2">/, '<Field className="space-y-2">')
                .replace(/<\/div>/, '</Field>')
                .replace(/<Label>/, '<FieldLabel>')
                .replace(/<\/Label>/, '</FieldLabel>')
                .replace(/className={fieldErrors\.[a-zA-Z]+ \? "border-destructive focus-visible:ring-destructive" : ""}/, `className={\`h-10 rounded-lg \${fieldErrors.${field.state} ? "border-destructive focus-visible:ring-destructive" : ""}\`}`);
  });
}

// One Portal Redirect Link
const onePortalRegex = /<div className="space-y-2">\s*<Label>One Portal Redirect Link<\/Label>\s*<Input type="url" value={onePortalRedirectLink} onChange={\(e\) => updateFieldValue\("onePortalRedirectLink", e\.target\.value, setOnePortalRedirectLink\)} onFocus={\(\) => setActiveVoiceField\("onePortalRedirectLink"\)} placeholder={isView \? "" : "https:\/\/one-portal\.example\.com"} disabled={isView} className={fieldErrors\.onePortalRedirectLink \? "border-destructive focus-visible:ring-destructive" : ""} \/>\s*{!isView && fieldErrors\.onePortalRedirectLink && <p className={inlineErrorClassName}>{fieldErrors\.onePortalRedirectLink}<\/p>}\s*{!isView && !fieldErrors\.onePortalRedirectLink && <p className="text-xs text-muted-foreground">Must be valid URL<\/p>}\s*<\/div>/;

content = content.replace(onePortalRegex, (match) => {
  return match.replace(/<div className="space-y-2">/, '<Field className="space-y-2">')
              .replace(/<\/div>/, '</Field>')
              .replace(/<Label>/, '<FieldLabel>')
              .replace(/<\/Label>/, '</FieldLabel>')
              .replace(/className={fieldErrors\.onePortalRedirectLink \? "border-destructive focus-visible:ring-destructive" : ""}/, `className={\`h-10 rounded-lg \${fieldErrors.onePortalRedirectLink ? "border-destructive focus-visible:ring-destructive" : ""}\`}`);
});

fs.writeFileSync(file, content);
console.log('Patch complete.');
