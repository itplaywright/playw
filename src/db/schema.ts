
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
    boolean,
    pgEnum,
    uniqueIndex,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const roleEnum = pgEnum("role", ["user", "admin"])
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"])
export const statusEnum = pgEnum("status", ["passed", "failed"])
export const menuTypeEnum = pgEnum("menu_type", ["internal", "external"])
export const adTypeEnum = pgEnum("ad_type", ["banner", "text", "cta"])
export const adPlacementEnum = pgEnum("ad_placement", ["global", "task"])
export const questionStatusEnum = pgEnum("question_status", ["pending", "answered"])
export const learningPathEnum = pgEnum("learning_path", ["theory", "practice"])
export const productTypeEnum = pgEnum("product_type", ["course", "disk", "other"])
export const purchaseStatusEnum = pgEnum("purchase_status", ["active", "expired", "cancelled"])

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    passwordHash: text("password_hash"),
    role: roleEnum("role").default("user"),
    isBlocked: boolean("is_blocked").default(false),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    learningPath: learningPathEnum("learning_path"),
    createdAt: timestamp("created_at").defaultNow(),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
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
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

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
)

export const tracks = pgTable("tracks", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    order: integer("order").default(0),
}, (table) => ({
    titleIdx: uniqueIndex("track_title_idx").on(table.title),
}))

export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    trackId: integer("track_id").references(() => tracks.id),
    title: text("title").notNull(),
    description: text("description").notNull(), // Markdown
    difficulty: difficultyEnum("difficulty").default("easy"),
    initialCode: text("initial_code").notNull(),
    // For MVP we can store expected result as text or a simple verification script
    expectedResult: text("expected_result"),
    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),
    // Quiz fields
    type: text("type", { enum: ["code", "quiz"] }).default("code").notNull(),
    options: text("options").array(), // For quiz answers
    correctAnswer: text("correct_answer"), // For quiz validation
}, (table) => ({
    trackTitleIdx: uniqueIndex("task_track_title_idx").on(table.trackId, table.title),
}))

export const taskQuestions = pgTable("task_questions", {
    id: serial("id").primaryKey(),
    taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    options: text("options").array().notNull(),
    correctAnswer: text("correct_answer").notNull(),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
})

export const results = pgTable("results", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    taskId: integer("task_id").references(() => tasks.id),
    status: statusEnum("status").notNull(),
    logs: text("logs"), // stdout/stderr
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").defaultNow(),
})

// CMS Tables
export const settings = pgTable("settings", {
    id: serial("id").primaryKey(),
    key: text("key").unique().notNull(),
    value: text("value"),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const menuItems = pgTable("menu_items", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    type: menuTypeEnum("type").default("internal"),
    order: integer("order").default(0),
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const adBlocks = pgTable("ad_blocks", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    type: adTypeEnum("type").default("banner"),
    placement: adPlacementEnum("placement").default("global"),
    content: text("content"), // для text/cta - HTML/Markdown
    imageUrl: text("image_url"), // для banner
    linkUrl: text("link_url"),
    buttonText: text("button_text"), // для cta
    order: integer("order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    taskId: integer("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    answer: text("answer"),
    status: questionStatusEnum("status").default("pending"),
    isReadByUser: boolean("is_read_by_user").default(true),
    isReadByAdmin: boolean("is_read_by_admin").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    answeredAt: timestamp("answered_at"),
})

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    price: integer("price").default(0).notNull(), // Amount in smallest currency unit
    type: productTypeEnum("type").default("course").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const userProducts = pgTable("user_products", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    status: purchaseStatusEnum("status").default("active"),
    purchasedAt: timestamp("purchased_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
})

import { relations } from "drizzle-orm"

export const userRelations = relations(users, ({ many }) => ({
    questions: many(questions),
    results: many(results),
    userProducts: many(userProducts),
}))

export const taskRelations = relations(tasks, ({ one, many }) => ({
    track: one(tracks, {
        fields: [tasks.trackId],
        references: [tracks.id],
    }),
    questions: many(questions),
    results: many(results),
    taskQuestions: many(taskQuestions),
}))

export const taskQuestionRelations = relations(taskQuestions, ({ one }) => ({
    task: one(tasks, {
        fields: [taskQuestions.taskId],
        references: [tasks.id],
    }),
}))

export const questionRelations = relations(questions, ({ one }) => ({
    user: one(users, {
        fields: [questions.userId],
        references: [users.id],
    }),
    task: one(tasks, {
        fields: [questions.taskId],
        references: [tasks.id],
    }),
}))

export const productRelations = relations(products, ({ many }) => ({
    userProducts: many(userProducts),
}))

export const userProductRelations = relations(userProducts, ({ one }) => ({
    user: one(users, {
        fields: [userProducts.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [userProducts.productId],
        references: [products.id],
    }),
}))
