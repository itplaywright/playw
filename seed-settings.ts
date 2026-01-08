
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/db";
import { settings, menuItems } from "@/db/schema";

async function seedSettings() {
    console.log("Seeding settings...");

    // 1. Settings
    const defaultSettings = [
        { key: "header_logo_url", value: "https://playwright.dev/img/playwright-logo.svg" },
        { key: "header_platform_name", value: "Playwright Platform" },
        { key: "header_theme", value: "dark" },
        { key: "header_visible", value: "true" },
    ];

    for (const s of defaultSettings) {
        await db.insert(settings)
            .values(s)
            .onConflictDoNothing({ target: settings.key }) // Skip if exists
            .returning();
    }

    // 2. Menu Items
    const items = [
        { title: "Програма", url: "#curriculum", order: 1 },
        { title: "Як це працює", url: "#how-it-works", order: 2 },
        { title: "FAQ", url: "#faq", order: 3 },
    ];

    for (const item of items) {
        // Check if duplicate title exists to avoid duplicates
        // A simplified check for this script
        // We'll just insert everything for now, assumes empty or handle conflict if we added unique constraint (we didn't on title)
        // Actually, let's just insert.
        await db.insert(menuItems).values(item);
    }

    console.log("Settings seeded!");
}

seedSettings()
    .catch(console.error)
    .finally(() => process.exit(0));
