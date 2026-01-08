import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
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
        GitHub(),
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
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            } else if (token.id) {
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.id, token.id as string),
                    columns: { isBlocked: true }
                })

                if (existingUser?.isBlocked) {
                    return null // Invalidate session
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                (session.user as any).role = token.role as string
            }
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
})
