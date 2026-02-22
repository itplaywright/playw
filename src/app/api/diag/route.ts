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
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const modelsRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        const modelsData = await modelsRes.json();

        const resultsCount = await db.execute(sql`SELECT count(*) FROM results`);
        const tasksCount = await db.execute(sql`SELECT count(*) FROM tasks`);

        return NextResponse.json({
            status: "success",
            database: {
                results: resultsCount.rows[0].count,
                tasks: tasksCount.rows[0].count,
            },
            ai: {
                api_key_defined: !!apiKey,
                api_key_prefix: apiKey ? apiKey.substring(0, 5) + "..." : "none",
                models_raw: modelsData,
                supported_models: (modelsData.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                    .map((m: any) => m.name)
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            error: error.message
        }, { status: 500 });
    }
}
