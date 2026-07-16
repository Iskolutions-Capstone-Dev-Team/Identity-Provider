const fs = require('fs');

const file = 'c:/Aaron/CAPSTONE/Identity-Provider/frontend/src/features/app-clients/components/AppClientModal.jsx';
let content = fs.readFileSync(file, 'utf-8');

const target = `className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-90"`;
const replacement = `className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-90 group-data-[panel-open]:rotate-90 group-data-[open]:rotate-90"`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.error('Target not found');
}
