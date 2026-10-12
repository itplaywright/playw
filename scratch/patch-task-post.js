const fs = require('fs');
let d = fs.readFileSync('src/app/api/admin/tasks/route.ts', 'utf8');

d = d.replace(`        const [__insertResult] = await db.insert(tasks).values({
            title,
            numbering,
            description,
            trackId: parseInt(trackId),
            difficulty: difficulty || 'easy',
            initialCode,
            order: order || 0,
            isActive: true
        })`, `        const [__insertResult] = await db.insert(tasks).values({
            title, titleEn, titleRu,
            numbering,
            description, descriptionEn, descriptionRu,
            trackId: parseInt(trackId),
            difficulty: difficulty || 'easy',
            initialCode,
            order: order || 0,
            isActive: true
        })`);

fs.writeFileSync('src/app/api/admin/tasks/route.ts', d);
