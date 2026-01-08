
import { db } from "@/db"
import { results, tasks, users } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import {
    Clock,
    Calendar,
    User,
    BookOpen,
    CheckCircle,
    XCircle,
    ChevronDown,
    ExternalLink,
    History
} from "lucide-react"

export default async function AdminAttemptsPage() {
    const allAttempts = await db.select({
        id: results.id,
        taskId: results.taskId,
        taskTitle: tasks.title,
        userId: results.userId,
        userEmail: users.email,
        status: results.status,
        durationMs: results.durationMs,
        createdAt: results.createdAt,
    })
        .from(results)
        .leftJoin(tasks, eq(results.taskId, tasks.id))
        .leftJoin(users, eq(results.userId, users.id))
        .orderBy(desc(results.createdAt))
        .limit(50)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Історія спроб</h1>
                <p className="text-sm text-gray-500 mt-1">Останні запуски тестів користувачами (ліміт: 50)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Користувач
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Завдання
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Тривалість
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Дата
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Деталі
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {allAttempts.map((attempt) => (
                            <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{attempt.userEmail}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
                                        <div className="text-sm text-gray-900 font-semibold">{attempt.taskTitle}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {attempt.status === "passed" ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700">
                                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> PASSED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> FAILED
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                                        {attempt.durationMs ? `${attempt.durationMs}ms` : "---"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                        {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString('uk-UA') : "---"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-tight">
                                        Переглянути <ExternalLink className="ml-1.5 h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allAttempts.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <History className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                        <p>Спроб виконання поки немає.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
