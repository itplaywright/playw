import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { settings, customBlocks } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import ReactMarkdown from "react-markdown"

import Hero from "@/components/landing/Hero"
import LanguagesBlocks from "@/components/landing/LanguagesBlocks"
import TargetAudience from "@/components/landing/TargetAudience"
import HowItWorks from "@/components/landing/HowItWorks"
import Skills from "@/components/landing/Skills"
import Curriculum from "@/components/landing/Curriculum"
import DashboardPreview from "@/components/landing/DashboardPreview"
import WhyPlaywright from "@/components/landing/WhyPlaywright"
import FAQ from "@/components/landing/FAQ"
import CallToAction from "@/components/landing/CallToAction"
import Footer from "@/components/landing/Footer"
import Setup from "@/components/landing/Setup"

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  // Load landing page settings
  const allSettings = await db.select().from(settings)
  const config = allSettings.reduce((acc, item) => {
    acc[item.key] = item.value
    return acc
  }, {} as Record<string, string | null>)

  // Helper to check if a block should be visible (default to true)
  const isVisible = (key: string) => config[key] !== "false"

  // Fetch custom blocks
  const customBlocksData = await db.select()
      .from(customBlocks)
      .where(and(eq(customBlocks.isVisible, true), eq(customBlocks.locale, params.locale)))
      .orderBy(asc(customBlocks.order))

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      <Hero />
      {isVisible("landing_languages") && <LanguagesBlocks />}
      {isVisible("landing_audience") && <TargetAudience />}
      {isVisible("landing_how_it_works") && <HowItWorks />}
      {isVisible("landing_setup") && <Setup />}
      {isVisible("landing_skills") && <Skills />}
      {isVisible("landing_curriculum") && <Curriculum />}
      {isVisible("landing_dashboard") && <DashboardPreview />}
      {isVisible("landing_why_playwright") && <WhyPlaywright />}
      
      {/* Custom Blocks rendered here before CTA */}
      {customBlocksData.map(block => (
        <section key={block.id} className="py-24 bg-background border-t border-white/5">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-invert prose-lg prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-500">
                    <ReactMarkdown>{block.content}</ReactMarkdown>
                </div>
            </div>
        </section>
      ))}

      {isVisible("landing_cta") && <CallToAction />}
      {isVisible("landing_faq") && <FAQ />}
      <Footer />
    </main>
  )
}
