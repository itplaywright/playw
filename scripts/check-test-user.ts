import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
    // Check the user who is likely testing (AlexLitvinenko123@gmail.com from the screenshot)
    const user = await db.query.users.findFirst({
        where: eq(users.email, "AlexLitvinenko123@gmail.com")
    });
    
    console.log("USER DATA:", JSON.stringify(user, null, 2));
    process.exit(0);
}

checkUser().catch(e => {
    console.error(e);
    process.exit(1);
});
