const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');
if (!d.includes("import { useLocale } from 'next-intl'")) {
    d = "import { useLocale } from 'next-intl';\n" + d;
    fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
}
