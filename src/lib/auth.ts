import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts, sessions, users, verificationTokens, roles } from "@/db/schema"
import { eq, or } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as any,
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials.email || !credentials.password) {
                    return null
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials.email as string),
                })

                if (!user || user.isBlocked) {
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash!)

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role || "user",
                    onboardingCompleted: user.onboardingCompleted ?? false,
                    learningPath: user.learningPath,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.onboardingCompleted = (user as any).onboardingCompleted ?? false
                token.learningPath = (user as any).learningPath
            } else if (token.id) {
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.id, token.id as string),
                    columns: { isBlocked: true, onboardingCompleted: true, learningPath: true, role: true }
                })

                if (existingUser?.isBlocked) {
                    return null // Invalidate session
                }
                if (existingUser) {
                    token.onboardingCompleted = existingUser.onboardingCompleted ?? false
                    token.learningPath = existingUser.learningPath
                    token.role = existingUser.role
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                    ; (session.user as any).role = token.role as string
                    ; (session.user as any).onboardingCompleted = token.onboardingCompleted as boolean
                    ; (session.user as any).learningPath = token.learningPath as string | null
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            try {
                // Find first role that is either marked as default or named 'Demo'
                const defaultRole = await db.query.roles.findFirst({
                    where: or(eq(roles.isDefault, true), eq(roles.name, "Demo")),
                    // Prioritize isDefault true over just 'Demo' name
                    orderBy: (roles, { desc }) => [desc(roles.isDefault)]
                })

                if (defaultRole && user.id) {
                    await db.update(users)
                        .set({ dynamicRoleId: defaultRole.id })
                        .where(eq(users.id, user.id))
                }
            } catch (error) {
                console.error("Error setting default role for new user:", error)
            }
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
})
