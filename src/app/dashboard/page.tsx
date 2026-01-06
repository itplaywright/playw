
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-zinc-900">
            <div className="max-w-4xl w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <form
                        action={async () => {
                            "use server"
                            await signOut()
                        }}
                    >
                        <button
                            type="submit"
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:hover:bg-zinc-700"
                        >
                            Sign out
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Welcome, {session.user.name || "User"}!</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        This is your protected dashboard. You are successfully logged in.
                    </p>
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-zinc-900 rounded text-sm font-mono overflow-auto">
                        <pre>{JSON.stringify(session.user, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
