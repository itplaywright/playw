import { auth } from "@/lib/auth"
import { db } from "@/db"
import { products, users } from "@/db/schema"
import { ne, eq, and } from "drizzle-orm"
import Link from "next/link"
import { ShoppingCart, Check, Zap, Crown, Shield } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function PricingPage() {
    const session = await auth()

    const activeProducts = await db
        .select()
        .from(products)
        .where(and(ne(products.title, "Demo"), eq(products.isActive, true)))

    const userData = session?.user?.email ? await db.query.users.findFirst({
        where: eq(users.email, session.user.email)
    }) : null

    const currentRoleId = userData?.dynamicRoleId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Zap className="w-4 h-4" />
                        Пробний період завершився
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Оберіть свій тариф
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Для продовження навчання виберіть підходящий план. Отримайте повний доступ до всіх матеріалів платформи.
                    </p>
                </div>

                {/* Products grid */}
                {activeProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {activeProducts.map((product, index) => {
                            const isPopular = index === 1
                            const isCurrentPlan = currentRoleId === product.grantedRoleId

                            return (
                                <div
                                    key={product.id}
                                    className={`relative rounded-3xl p-8 flex flex-col h-full transition-all ${isCurrentPlan
                                        ? "bg-slate-800/80 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/10"
                                        : isPopular
                                            ? "bg-blue-600 border-2 border-blue-400 shadow-2xl shadow-blue-500/30"
                                            : "bg-white/5 border border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
                                            <span className="bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                                                ✅ Ваш поточний тариф
                                            </span>
                                        </div>
                                    )}

                                    {!isCurrentPlan && isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
                                            <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20 whitespace-nowrap">
                                                🔥 Популярний
                                            </span>
                                        </div>
                                    )}

                                    <div className={`p-3 rounded-2xl inline-flex mb-4 w-fit ${isPopular ? "bg-white/20" : "bg-blue-500/10"}`}>
                                        {product.type === "course" ? (
                                            <Crown className={`w-6 h-6 ${isPopular ? "text-white" : "text-blue-400"}`} />
                                        ) : (
                                            <Shield className={`w-6 h-6 ${isPopular ? "text-white" : "text-blue-400"}`} />
                                        )}
                                    </div>

                                    <h2 className={`text-xl font-black mb-2 ${isPopular ? "text-white" : "text-white"}`}>
                                        {product.title}
                                    </h2>
                                    <p className={`text-sm mb-6 flex-1 ${isPopular ? "text-blue-100" : "text-slate-400"}`}>
                                        {product.description || "Повний доступ до матеріалів платформи."}
                                    </p>

                                    <div className="mt-auto space-y-6">
                                        <div className={`text-4xl font-black ${isPopular ? "text-white" : "text-white"}`}>
                                            {product.price === 0 ? "Безкоштовно" : 
                                             product.currency === "UAH" ? `${(product.price / 100).toLocaleString()} ₴` :
                                             product.currency === "USD" ? `$${(product.price / 100).toLocaleString()}` :
                                             `${(product.price / 100).toLocaleString()} ${product.currency}`}
                                        </div>

                                        {isCurrentPlan ? (
                                            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <Check className="w-4 h-4" />
                                                Активно
                                            </div>
                                        ) : (
                                        <Link
                                            href={`/checkout?productId=${product.id}`}
                                            className={`relative z-20 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${isPopular
                                                ? "bg-white text-blue-600 hover:bg-blue-50"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Обрати тариф
                                        </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center mb-10">
                        <Crown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-medium">Тарифи ще не налаштовані.</p>
                        <p className="text-slate-500 text-sm mt-2">Зверніться до адміністратора платформи.</p>
                    </div>
                )}

                {/* Bottom links */}
                <div className="flex justify-center gap-6 text-sm">
                    {session?.user ? (
                        <Link href="/cabinet" className="text-slate-400 hover:text-white transition-colors">
                            Мій кабінет
                        </Link>
                    ) : (
                        <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                            Увійти
                        </Link>
                    )}
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        Головна
                    </Link>
                </div>
            </div>
        </div>
    )
}
