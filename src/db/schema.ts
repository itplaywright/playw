import {
    timestamp,
    mysqlTable,
    varchar,
    text,
    primaryKey,
    int,
    boolean,
    mysqlEnum,
    uniqueIndex,
    json,
} from "drizzle-orm/mysql-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const roleEnumValues = ["user", "admin"] as const
export const difficultyEnumValues = ["easy", "medium", "hard"] as const
export const statusEnumValues = ["passed", "failed"] as const
export const menuTypeEnumValues = ["internal", "external"] as const
export const adTypeEnumValues = ["banner", "text", "cta"] as const
export const adPlacementEnumValues = ["global", "task"] as const
export const questionStatusEnumValues = ["pending", "answered"] as const
export const learningPathEnumValues = ["theory", "practice"] as const
export const productTypeEnumValues = ["course", "disk", "b2c", "subscription", "b2b", "other"] as const
export const purchaseStatusEnumValues = ["active", "expired", "cancelled"] as const
export const projectPriorityEnumValues = ["low", "medium", "high", "critical"] as const
export const currencyEnumValues = ["USD", "UAH", "EUR"] as const
export const submissionStatusEnumValues = ["pending", "reviewed", "rejected"] as const

export const users = mysqlTable("user", {
    id: varchar("id", { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    passwordHash: text("password_hash"),
    role: mysqlEnum("role", roleEnumValues).default("user"),
    dynamicRoleId: int("dynamic_role_id").references(() => roles.id, { onDelete: "set null" }),
    isBlocked: boolean("is_blocked").default(false),
    onboardingCompleted: boolean("onboarding_completed").default(false),
    learningPath: mysqlEnum("learning_path", learningPathEnumValues),
    createdAt: timestamp("created_at").defaultNow(),
})

export const accounts = mysqlTable(
    "account",
    {
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: varchar("type", { length: 255 }).$type<AdapterAccountType>().notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: int("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = mysqlTable("session", {
    sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = mysqlTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
)

export const roles = mysqlTable("roles", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
    maxTrackOrder: int("max_track_order").default(0),
    hasPracticeAccess: boolean("has_practice_access").default(false),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow(),
})

export const tracks = mysqlTable("tracks", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    order: int("order").default(0),
}, (table) => ({
    titleIdx: uniqueIndex("track_title_idx").on(table.title),
}))

export const tasks = mysqlTable("tasks", {
    id: int("id").primaryKey().autoincrement(),
    trackId: int("track_id").references(() => tracks.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(), // Markdown
    difficulty: mysqlEnum("difficulty", difficultyEnumValues).default("easy"),
    initialCode: text("initial_code").notNull(),
    expectedResult: text("expected_result"),
    order: int("order").default(0),
    isActive: boolean("is_active").default(true),
    type: mysqlEnum("type", ["code", "quiz"]).default("code").notNull(),
    options: json("options").$type<string[]>(), // For quiz answers
    correctAnswer: text("correct_answer"), // For quiz validation
    videoUrl: text("video_url"), // Auto-generated Ukrainian voiceover video
}, (table) => ({
    trackTitleIdx: uniqueIndex("task_track_title_idx").on(table.trackId, table.title),
}))

export const taskQuestions = mysqlTable("task_questions", {
    id: int("id").primaryKey().autoincrement(),
    taskId: int("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    options: json("options").$type<string[]>().notNull(),
    correctAnswer: text("correct_answer").notNull(),
    order: int("order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
})

export const results = mysqlTable("results", {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id, { onDelete: "cascade" }),
    taskId: int("task_id").references(() => tasks.id),
    status: mysqlEnum("status", statusEnumValues).notNull(),
    logs: text("logs"), // stdout/stderr
    durationMs: int("duration_ms"),
    createdAt: timestamp("created_at").defaultNow(),
})

export const settings = mysqlTable("settings", {
    id: int("id").primaryKey().autoincrement(),
    key: varchar("key", { length: 255 }).unique().notNull(),
    value: text("value"),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const menuItems = mysqlTable("menu_items", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    type: mysqlEnum("type", menuTypeEnumValues).default("internal"),
    order: int("order").default(0),
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const adBlocks = mysqlTable("ad_blocks", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    type: mysqlEnum("type", adTypeEnumValues).default("banner"),
    placement: mysqlEnum("placement", adPlacementEnumValues).default("global"),
    content: text("content"), // для text/cta - HTML/Markdown
    imageUrl: text("image_url"), // для banner
    linkUrl: text("link_url"),
    buttonText: varchar("button_text", { length: 255 }), // для cta
    order: int("order").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const questions = mysqlTable("questions", {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    taskId: int("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    answer: text("answer"),
    status: mysqlEnum("status", questionStatusEnumValues).default("pending"),
    isReadByUser: boolean("is_read_by_user").default(true),
    isReadByAdmin: boolean("is_read_by_admin").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    answeredAt: timestamp("answered_at"),
})

export const products = mysqlTable("products", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    price: int("price").default(0).notNull(), // Amount in smallest currency unit
    currency: mysqlEnum("currency", currencyEnumValues).default("USD").notNull(),
    type: mysqlEnum("product_type", productTypeEnumValues).default("course").notNull(),
    durationMonths: int("duration_months").default(1), // Used for subscription types
    grantedRoleId: int("granted_role_id").references(() => roles.id, { onDelete: "set null" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const userProducts = mysqlTable("user_products", {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", purchaseStatusEnumValues).default("active"),
    purchasedAt: timestamp("purchased_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
})

export const accessCodes = mysqlTable("access_codes", {
    id: int("id").primaryKey().autoincrement(),
    code: varchar("code", { length: 255 }).unique().notNull(),
    productId: int("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    maxUses: int("max_uses").default(1).notNull(),
    usedCount: int("used_count").default(0).notNull(),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
})

export const taskSubmissions = mysqlTable("task_submissions", {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    taskId: int("task_id")
        .notNull()
        .references(() => tasks.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    mentorFeedback: text("mentor_feedback"),
    status: mysqlEnum("status", submissionStatusEnumValues).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
    isSeen: boolean("is_seen").default(false),
})

export const projectBoards = mysqlTable("project_boards", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
})

export const projectColumns = mysqlTable("project_columns", {
    id: int("id").primaryKey().autoincrement(),
    boardId: int("board_id").notNull().references(() => projectBoards.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    order: int("order").default(0),
    color: varchar("color", { length: 255 }),
})

export const projectTasks = mysqlTable("project_tasks", {
    id: int("id").primaryKey().autoincrement(),
    boardId: int("board_id").notNull().references(() => projectBoards.id, { onDelete: "cascade" }),
    columnId: int("column_id").notNull().references(() => projectColumns.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    priority: mysqlEnum("priority", projectPriorityEnumValues).default("medium"),
    assigneeId: varchar("assignee_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    creatorId: varchar("creator_id", { length: 255 }).references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 255 }).default("todo"),
    order: int("order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

import { relations } from "drizzle-orm"

export const userRelations = relations(users, ({ one, many }) => ({
    questions: many(questions),
    results: many(results),
    userProducts: many(userProducts),
    dynamicRole: one(roles, {
        fields: [users.dynamicRoleId],
        references: [roles.id],
    }),
}))

export const roleRelations = relations(roles, ({ many }) => ({
    users: many(users),
    products: many(products),
}))

export const taskRelations = relations(tasks, ({ one, many }) => ({
    track: one(tracks, {
        fields: [tasks.trackId],
        references: [tracks.id],
    }),
    questions: many(questions),
    results: many(results),
    taskQuestions: many(taskQuestions),
    submissions: many(taskSubmissions),
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

export const productRelations = relations(products, ({ one, many }) => ({
    userProducts: many(userProducts),
    accessCodes: many(accessCodes),
    grantedRole: one(roles, {
        fields: [products.grantedRoleId],
        references: [roles.id],
    }),
}))

export const accessCodeRelations = relations(accessCodes, ({ one }) => ({
    product: one(products, {
        fields: [accessCodes.productId],
        references: [products.id],
    }),
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

export const projectBoardRelations = relations(projectBoards, ({ many }) => ({
    columns: many(projectColumns),
    tasks: many(projectTasks),
}))

export const projectColumnRelations = relations(projectColumns, ({ one, many }) => ({
    board: one(projectBoards, {
        fields: [projectColumns.boardId],
        references: [projectBoards.id],
    }),
    tasks: many(projectTasks),
}))

export const projectTaskRelations = relations(projectTasks, ({ one }) => ({
    board: one(projectBoards, {
        fields: [projectTasks.boardId],
        references: [projectBoards.id],
    }),
    column: one(projectColumns, {
        fields: [projectTasks.columnId],
        references: [projectColumns.id],
    }),
    assignee: one(users, {
        fields: [projectTasks.assigneeId],
        references: [users.id],
    }),
    creator: one(users, {
        fields: [projectTasks.creatorId],
        references: [users.id],
    }),
}))

export const taskSubmissionRelations = relations(taskSubmissions, ({ one }) => ({
    user: one(users, {
        fields: [taskSubmissions.userId],
        references: [users.id],
    }),
    task: one(tasks, {
        fields: [taskSubmissions.taskId],
        references: [tasks.id],
    }),
}))
