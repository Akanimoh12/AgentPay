import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config";

async function main() {
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL,
	});
	const db = drizzle(pool);
	await migrate(db, { migrationsFolder: "./src/db/migrations" });
	await pool.end();
	console.log("Migrations complete");
}

main().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
