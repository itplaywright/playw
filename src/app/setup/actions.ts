"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function completeOnboarding() {
    const session = await auth()
    
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    await db.update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, session.user.id))

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/setup")
}
