import { db } from "../src/db/index.js";
import { tracks } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    await db.update(tracks).set({
        title: "Рівень 0 — Основи TypeScript",
        titleEn: "Level 0 — TypeScript Basics",
        titleRu: "Уровень 0 — Основы TypeScript",
        description: "Базові концепції мови, необхідні для швидкого старту з автотестами.",
        descriptionEn: "Basic language concepts needed for a quick start with autotests.",
        descriptionRu: "Базовые концепции языка, необходимые для быстрого старта с автотестами."
    }).where(eq(tracks.id, 72));
    process.exit(0);
}
main();
