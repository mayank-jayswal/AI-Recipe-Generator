import dotenv from "dotenv";
import fs from "fs";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";


const { Pool } = pkg;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log("Running database migration...");

        const schemapath = path.join(__dirname, "config","schema.sql");
        const schemasql = fs.readFileSync(schemapath, "utf-8");

        await client.query(schemasql);

        console.log("Database migrated successfully");
        console.log("Tables Created:");
        console.log("- users");
        console.log("- user_preferences");
        console.log("- pantry_items");
        console.log("- recipes");
        console.log("- recipe_ingredients");
        console.log("- recipe_nutrition");
        console.log("- meal_plans");
        console.log("- shopping_list_items");   

    } catch (error) {
        console.error("Error migrating database:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();

