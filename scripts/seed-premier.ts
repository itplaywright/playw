import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { projectBoards, projectColumns, projectTasks, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🚀 Seeding Premier Online project...");

  const admin = (await db.select().from(users).where(eq(users.role, "admin")).limit(1))[0];
  if (!admin) {
    console.error("❌ Admin user not found!");
    process.exit(1);
  }

  // 1. Create the Board
  const [board] = await db.insert(projectBoards).values({
    title: "Premier Online - Event Registration Platform",
    description: "Тестування платформи для реєстрації на спортивні заходи (MENA region). Фокус на пошуку, реєстрації та особистому кабінеті.",
  }).$returningId();

  const boardId = board.id;
  console.log(`✅ Created board with ID: ${boardId}`);

  // 2. Create Columns
  const columnsData = [
    { title: "To Do", order: 1, color: "bg-slate-500" },
    { title: "In Progress", order: 2, color: "bg-blue-500" },
    { title: "Done", order: 3, color: "bg-emerald-500" },
  ];

  const insertedColumns = [];
  for (const col of columnsData) {
    const [insertedCol] = await db.insert(projectColumns).values({
      boardId,
      title: col.title,
      order: col.order,
      color: col.color,
    }).$returningId();
    insertedColumns.push({ ...col, id: insertedCol.id });
  }

  const todoId = insertedColumns.find(c => c.title === "To Do")!.id;
  console.log("✅ Columns created.");

  // 3. Create Tasks
  const premierTasks = [
    {
      title: "UI: Валідація пошуку івентів",
      description: "Перевірити, що фільтрація за категорією 'Marathon' та регіоном 'MENA' повертає відповідні результати.",
      priority: "medium" as const
    },
    {
      title: "UI: Реєстрація гостя (Guest Checkout)",
      description: "Протестувати шлях реєстрації на івент без створення повноцінного акаунту. Перевірити обов'язкові поля.",
      priority: "high" as const
    },
    {
      title: "UI: Валідація Mobile Burger Menu",
      description: "Перевірити працездатність навігаційного меню на мобільних пристроях (iPhone 14 Pro).",
      priority: "medium" as const
    },
    {
      title: "UI: Застосування промокоду",
      description: "Перевірити логіку поля 'Promo Code' в кошику: валідний код дає знижку, невалідний — помилку.",
      priority: "medium" as const
    },
    {
      title: "UI: Сортування таблиці результатів",
      description: "Перевірити, що таблиця 'Race Results' коректно сортується за часом (Time) та позицією (Position).",
      priority: "low" as const
    },
    {
      title: "UI: Редагування профілю учасника",
      description: "Перевірити зміну контактної інформації та додавання 'Emergency Contact' у налаштуваннях профілю.",
      priority: "medium" as const
    },
    {
      title: "API: Отримання деталей івенту (GET)",
      description: "Перевірити, що за запитом /api/event/{id} приходять валідні дані: title, date, location, registration_open.",
      priority: "high" as const
    },
    {
      title: "API: Створення акаунту (POST)",
      description: "Протестувати REST API для реєстрації: перевірити обробку дублікатів email та слабких паролів.",
      priority: "high" as const
    },
    {
      title: "UI: Кнопка 'Add to Calendar' (iCal/Google)",
      description: "Перевірити, що при кліку на кнопку генерується файл або посилання на подію в календарі.",
      priority: "low" as const
    },
    {
      title: "UI: Cookie Consent Banner",
      description: "Перевірити, що банер з'являється при першому візиті та зникає після прийняття. Перевірити збереження вибору в Cookie.",
      priority: "low" as const
    },
    {
      title: "UI: Refund Policy UI Logic",
      description: "Перевірити, що кнопка 'Cancel & Refund' стає неактивною після закінчення дедлайну, вказаного в політиці івенту.",
      priority: "medium" as const
    },
    {
      title: "UI: Картка івенту - Валідація Badge",
      description: "Перевірити, що бейджі 'Registration Open' та 'Limited Slots' відображаються коректно відповідно до статусу.",
      priority: "low" as const
    }
  ];

  for (const [index, t] of premierTasks.entries()) {
    await db.insert(projectTasks).values({
      boardId,
      columnId: todoId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      creatorId: admin.id,
      status: "todo",
      order: index + 1,
    });
  }

  console.log("✅ Seeding complete!");
  console.log("🏁 Premier Online project seeded successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
