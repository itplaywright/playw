const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');

// Remove the wrongly placed helper variables
d = d.replace(`
  const locale = useLocale();
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
`, "");

// Add them after }: Props) {
const tHelper = `
  const locale = useLocale();
  const getTrackTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
  const getTaskTitle = (t: any) => (locale === 'en' && t?.titleEn) || (locale === 'ru' && t?.titleRu) || t?.title || '';
`;
d = d.replace("}: Props) {", "}: Props) {\n" + tHelper);

fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
