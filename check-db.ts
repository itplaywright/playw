import { config } from "dotenv";
config({ path: ".env.local" });
const dbUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL type:", typeof dbUrl);
console.log("DATABASE_URL length:", dbUrl?.length);
if (dbUrl) {
    console.log("DATABASE_URL starts with:", dbUrl.substring(0, 10) + "...");
} else {
    console.error("DATABASE_URL is missing!");
}

import { db } from "@/db";
import { settings, menuItems } from "@/db/schema";

async function checkSettings() {
    const currentSettings = await db.select().from(settings);
    console.log("Settings:", currentSettings);

    const currentMenu = await db.select().from(menuItems);
    console.log("Menu Items:", currentMenu);
}

checkSettings()
    .catch(console.error)
    .finally(() => process.exit(0));
