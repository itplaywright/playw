import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, Map } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function TheoryPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    if (!(session.user as any).onboardingCompleted) {
        redirect("/setup")
    }

    const t = await getTranslations("Theory")

    return (
        <div className="min-h-screen bg-background pb-20 text-foreground">
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-purple-600/5 to-transparent blur-[120px] dark:from-purple-600/10" />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight mb-4 flex items-center justify-center gap-3">
                        <BookOpen className="w-10 h-10 text-purple-500" />
                        {t("title")}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="glass rounded-3xl p-10 text-center max-w-2xl mx-auto dark:glass-dark border border-border">
                    <p className="text-lg text-muted-foreground mb-8">
                        {t("underDev")}
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Map className="w-5 h-5 mr-2" />
                        {t("goToPractice")}
                    </Link>
                </div>
            </main>
        </div>
    )
}
