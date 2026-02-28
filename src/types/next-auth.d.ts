
import { type DefaultSession, type User as DefaultUser } from "next-auth"
import { type AdapterUser as DefaultAdapterUser } from "next-auth/adapters"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            onboardingCompleted: boolean
            learningPath?: string | null
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
        onboardingCompleted: boolean
        learningPath?: string | null
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser extends DefaultAdapterUser {
        role: string
        onboardingCompleted: boolean
        learningPath?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        onboardingCompleted: boolean
        learningPath?: string | null
    }
}
