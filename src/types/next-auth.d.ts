
import { type DefaultSession, type User as DefaultUser } from "next-auth"
import { type AdapterUser as DefaultAdapterUser } from "next-auth/adapters"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser extends DefaultAdapterUser {
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}
