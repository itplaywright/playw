import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

import Hero from "@/components/landing/Hero"
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

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      <Hero />
      <TargetAudience />
      <HowItWorks />
      <Setup />
      <Skills />
      <Curriculum />
      <DashboardPreview />
      <WhyPlaywright />
      <CallToAction />
      <FAQ />
      <Footer />
    </main >
  )
}
