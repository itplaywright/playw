const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');

const anchor = "const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';";
const toInsert = `
  const getTrackDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';
  const getTaskDesc = (t: any) => (locale === 'en' && t?.descriptionEn) || (locale === 'ru' && t?.descriptionRu) || t?.description || '';
`;

if (!d.includes('getTrackDesc = (t: any)')) {
    d = d.replace(anchor, anchor + "\n" + toInsert);
    fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
}
