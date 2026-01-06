

import { config } from "dotenv"
config({ path: ".env.local" })
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"



export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET,
        }),
    ],
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id
            return session
        },
    },
})
