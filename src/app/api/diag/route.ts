import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const apiKeys = [
            { name: "GEMINI_API_KEY", key: process.env.GEMINI_API_KEY?.trim() },
            { name: "GEMINI_API_KEY_2", key: process.env.GEMINI_API_KEY_2?.trim() },
            { name: "GEMINI_API_KEY_3", key: process.env.GEMINI_API_KEY_3?.trim() },
        ].filter(item => !!item.key);

        const aiStatus = [];

        for (const item of apiKeys) {
            try {
                const modelsRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models?key=${item.key}`
                );
                const modelsData = await modelsRes.json();

                aiStatus.push({
                    name: item.name,
                    api_key_prefix: item.key ? item.key.substring(0, 5) + "..." : "none",
                    models_raw: modelsData,
                    supported_models: (modelsData.models || [])
                        .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                        .map((m: any) => m.name)
                });
            } catch (err: any) {
                aiStatus.push({
                    name: item.name,
                    error: err.message
                });
            }
        }

        const resultsCount = await db.execute(sql`SELECT count(*) FROM results`);
        const tasksCount = await db.execute(sql`SELECT count(*) FROM tasks`);

        return NextResponse.json({
            status: "success",
            database: {
                results: resultsCount.rows[0].count,
                tasks: tasksCount.rows[0].count,
            },
            ai_keys: aiStatus
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            error: error.message
        }, { status: 500 });
    }
}
