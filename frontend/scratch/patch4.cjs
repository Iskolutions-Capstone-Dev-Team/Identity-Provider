const fs = require('fs');

const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

const replacements = [
  {
    target: `<span className="text-sm text-muted-foreground">Not provided</span>`,
    replacement: `<span className="text-sm text-muted-foreground"></span>`
  }
];

let modified = content;
replacements.forEach(({target, replacement}) => {
  modified = modified.split(target).join(replacement);
});

if (modified !== content) {
  fs.writeFileSync(file, modified);
  console.log('Success');
} else {
  console.error('Target not found');
}
