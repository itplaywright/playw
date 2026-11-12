import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, MessageSquare, Ticket, ShieldCheck, Zap } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function CheckoutPage({
    searchParams
}: {
    searchParams: Promise<{ productId?: string }>
}) {
    const session = await auth()
    if (!session) {
        redirect("/login?callbackUrl=/pricing")
    }

    const { productId } = await searchParams
    if (!productId) {
        redirect("/pricing")
    }

    const product = await db.query.products.findFirst({
        where: eq(products.id, parseInt(productId))
    })

    if (!product) {
        redirect("/pricing")
    }

    const t = await getTranslations("Checkout")

    const displayPrice = product.price === 0 ? "Безкоштовно" : 
        product.currency === "UAH" ? `${(product.price / 100).toLocaleString()} ₴` :
        product.currency === "USD" ? `$${(product.price / 100).toLocaleString()}` :
        `${(product.price / 100).toLocaleString()} ${product.currency}`

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/pricing" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        {t("backToPlans")}
                    </Link>
                    <div className="font-bold text-slate-900 dark:text-white">{t("orderTitle")}</div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                    {/* Left: Product Info */}
                    <div className="md:col-span-3 space-y-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t("selectedPlan")}</h1>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 h-full flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                    <Zap className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest w-fit mb-4">
                                        {product.type === "subscription" ? t("subscription") : t("lifetime")}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{product.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">{product.description}</p>
                                    <div className="text-3xl font-black text-slate-900 dark:text-white">{displayPrice}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t("choosePayment")}</h2>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group opacity-60 cursor-not-allowed">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                            <CreditCard className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-slate-900 dark:text-white">{t("bankCard")}</div>
                                            <div className="text-xs text-slate-500">{t("cardSoon")}</div>
                                        </div>
                                    </div>
                                </button>

                                <a 
                                    href={`https://t.me/playwrightfortestbot?start=buy_${product.id}`} 
                                    target="_blank"
                                    className="w-full flex items-center justify-between p-6 bg-blue-600 border-2 border-blue-500 rounded-2xl hover:bg-blue-700 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl">
                                            <MessageSquare className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">{t("payViaManager")}</div>
                                            <div className="text-xs text-blue-100 italic">{t("writeTelegram")}</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                                </a>
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex gap-4">
                            <Ticket className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
                            <div>
                                <div className="font-bold text-amber-900 dark:text-amber-400 text-sm">{t("haveAccessKey")}</div>
                                <p className="text-amber-700 dark:text-amber-500 text-xs mb-3">{t("accessKeyDesc")}</p>
                                <Link href="/activate" className="text-amber-600 dark:text-amber-500 text-xs font-black underline hover:no-underline uppercase tracking-wider">
                                    {t("activateCode")}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary Panel */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">{t("yourOrder")}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t("item")}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{product.title}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t("access")}</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{t("instantAccess")}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                <div className="text-slate-500 text-sm">{t("totalToPay")}</div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{displayPrice}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 text-xs text-slate-400 text-center">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            {t("secureNotice")}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
