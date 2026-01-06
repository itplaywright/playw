import { pgTable, text, serial, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

// --- NextAuth Tables ---

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").default("STUDENT"), // Added custom field
    githubUsername: text("github_username"), // Added custom field
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
);

// --- Application Tables ---

export const tracks = pgTable("tracks", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    level: text("level").notNull(), // Junior, Middle
    isActive: boolean("is_active").default(true),
});

export const modules = pgTable("modules", {
    id: serial("id").primaryKey(),
    trackId: integer("track_id").references(() => tracks.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
});

export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id").references(() => modules.id, { onDelete: 'cascade' }),
    title: text("title").notNull(),
    description: text("description"), // Markdown
    repoTemplateUrl: text("repo_template_url"),
    instructions: text("instructions"),
    expectedResult: text("expected_result"),
});

export const submissions = pgTable("submissions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }), // Changed to text to match users.id UUID
    taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }),
    status: text("status").notNull(), // PENDING, SUCCESS, FAILED
    logs: text("logs"),
    repoUrl: text("repo_url"),
    attemptCount: integer("attempt_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
