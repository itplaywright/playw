const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');

const tHelper = `
  const locale = useLocale();
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
`;

d = d.replace(/selectedTrack\.title/g, "getTrackTitle(selectedTrack)")
     .replace(/nextTask\.title/g, "getTaskTitle(nextTask)")
     .replace(/task\.title/g, "getTaskTitle(task)")
     .replace(/track\.title/g, "getTrackTitle(track)");

if (!d.includes('getTrackTitle')) {
    d = d.replace("export default function DashboardClient({", "export default function DashboardClient({\n" + tHelper);
}

fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
