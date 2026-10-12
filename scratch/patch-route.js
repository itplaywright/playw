const fs = require('fs');
let d = fs.readFileSync('src/app/api/admin/tasks/route.ts', 'utf8');

// For POST
d = d.replace(`.values({
                title,
                numbering,
                description,
                trackId: trackId ? parseInt(trackId) : undefined,
                difficulty,
                initialCode,
                order,
                isActive,
                videoUrl: videoUrl ?? undefined
            })`, `.values({
                title,
                titleEn,
                titleRu,
                numbering,
                description,
                descriptionEn,
                descriptionRu,
                trackId: trackId ? parseInt(trackId) : undefined,
                difficulty,
                initialCode,
                order,
                isActive,
                videoUrl: videoUrl ?? undefined
            })`);

// For PATCH
d = d.replace(`.set({
                title,
                numbering,
                description,
                trackId: trackId ? parseInt(trackId) : undefined,
                difficulty,
                initialCode,
                order,
                isActive,
                videoUrl: videoUrl ?? undefined
            })`, `.set({
                title,
                titleEn,
                titleRu,
                numbering,
                description,
                descriptionEn,
                descriptionRu,
                trackId: trackId ? parseInt(trackId) : undefined,
                difficulty,
                initialCode,
                order,
                isActive,
                videoUrl: videoUrl ?? undefined
            })`);

fs.writeFileSync('src/app/api/admin/tasks/route.ts', d);
console.log("ROUTE PATCHED");
