
import { db } from "@/db"
import { tasks, users, results, tracks } from "@/db/schema"
import { count, eq, sql, desc, avg } from "drizzle-orm"
import {
    Users as UsersIcon,
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    BarChart3
} from "lucide-react"

export default async function AdminDashboard() {
    // 1. Basic Stats
    const usersCount = await db.select({ value: count() }).from(users)
    const activeTasksCount = await db.select({ value: count() }).from(tasks).where(eq(tasks.isActive, true))
    const totalAttempts = await db.select({ value: count() }).from(results)

    // 2. Success Rate Calculation
    const passedAttempts = await db.select({ value: count() }).from(results).where(eq(results.status, "passed"))
    const successRate = totalAttempts[0].value > 0
        ? Math.round((passedAttempts[0].value / totalAttempts[0].value) * 100)
        : 0

    // 3. Problematic Tasks (Tasks with most failures)
    const problematicTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        failCount: count(results.id)
    })
        .from(tasks)
        .leftJoin(results, eq(tasks.id, results.taskId))
        .where(eq(results.status, "failed"))
        .groupBy(tasks.id)
        .orderBy(desc(count(results.id)))
        .limit(5)

    const stats = [
        { name: "Користувачі", value: usersCount[0].value, icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-100" },
        { name: "Активні задачі", value: activeTasksCount[0].value, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
        { name: "Успішність", value: `${successRate}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
        { name: "Всього спроб", value: totalAttempts[0].value, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-100" },
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-xl ${item.bg} ${item.color} mr-4`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Problematic Tasks */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                            Проблемні завдання
                        </h3>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Top 5 Failures</span>
                    </div>
                    <div className="space-y-4">
                        {problematicTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex-1 mr-4">
                                    <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                                    <p className="text-xs text-gray-500 uppercase">ID: #{task.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                        {task.failCount} помилок
                                    </span>
                                </div>
                            </div>
                        ))}
                        {problematicTasks.length === 0 && (
                            <p className="text-center text-gray-500 py-10">Спроб з помилками поки немає.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Recent Activity Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Швидкі дії</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <a href="/admin/tasks" className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group">
                            <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-blue-900">Нова задача</span>
                        </a>
                        <a href="/admin/users" className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors group">
                            <UsersIcon className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-green-900">Користувачі</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
