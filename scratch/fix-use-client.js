const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');
d = d.replace("import { useLocale } from 'next-intl';\n\"use client\"", "\"use client\"\nimport { useLocale } from 'next-intl';");
fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
