import { db } from "./lib/db/src/index";
import { safeCareers } from "./lib/db/src/schema/live_signals";

async function checkCareers() {
  try {
    const all = await db.select().from(safeCareers);
    console.log(JSON.stringify(all, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkCareers();
