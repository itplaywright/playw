const fs = require('fs');
let d = fs.readFileSync('src/components/admin/AdminSidebarItems.tsx', 'utf8');
d = d.replace('className="flex-1 px-4 py-6 space-y-1 overflow-y-auto"', 'className="px-4 py-6 space-y-1"');
fs.writeFileSync('src/components/admin/AdminSidebarItems.tsx', d);
