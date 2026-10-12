const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');

const tHelper = `
  const locale = useLocale();
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
`;

if (!d.includes('const getTrackTitle =')) {
    d = d.replace("export default function DashboardClient({", "export default function DashboardClient({\n" + tHelper);
    fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
}
