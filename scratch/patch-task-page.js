const fs = require('fs');
let d = fs.readFileSync('src/app/[locale]/tasks/[id]/page.tsx', 'utf8');

if (!d.includes('getLocale')) {
    d = d.replace('import { checkHasAccess } from "@/lib/access"', 'import { checkHasAccess } from "@/lib/access"\nimport { getLocale } from "next-intl/server"');
    
    d = d.replace('if (!task) notFound()', `if (!task) notFound()

    const locale = await getLocale()
    if (locale === 'en') {
        task.title = task.titleEn || task.title
        task.description = task.descriptionEn || task.description
    } else if (locale === 'ru') {
        task.title = task.titleRu || task.title
        task.description = task.descriptionRu || task.description
    }`);

    fs.writeFileSync('src/app/[locale]/tasks/[id]/page.tsx', d);
    console.log("LOCALE PATCHED IN TASK PAGE");
} else {
    console.log("ALREADY PATCHED");
}
