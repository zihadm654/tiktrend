import { Pool } from "@neondatabase/serverless";
import { env } from "@tiktrend/env/server";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema/index";

// The WebSocket (Pool) driver is used instead of the HTTP driver so that
// `db.transaction(...)` works for order placement and stock restoration.
// Node 22+ and Bun provide a global WebSocket, so no `ws` constructor is needed.
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
