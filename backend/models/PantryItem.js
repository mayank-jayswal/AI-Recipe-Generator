import db from "../config/db.js";

class PantryItem {
    /**
     * Create new pantry Item
     */

    static async create(userId, itemData) {
        const { name, quantity, unit, category, expiry_date, is_running_low = false } = itemData;

        const result = await db.query(
            `INSERT INTO pantry_items 
            (user_id, name, quantity, unit,category, expiry_date, is_running_low) VALUES 
            ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, name, quantity, unit, category, expiry_date, is_running_low]
        );
        return result.rows[0];
    }

    /**
     * 
     * Get all pantry items for a user
     */
    static async findByUserId(userId, filters = {}) {

        let query = `SELECT * FROM pantry_items WHERE user_id = $1`

        let params = [userId];

        let paramCount = 1;

        if(filters.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);   
        }

        if(filters.is_running_low) {
            paramCount++;
            query += ` AND is_running_low = $${paramCount}`;
            params.push(filters.is_running_low);
        }

        if(filters.search) {
            paramCount++;
            query += ` AND name LIKE $${paramCount}`;
            params.push(`%${filters.search}%`);
        }

        query += ` ORDER BY created_at DESC`

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * 
     * Find items that are expiring soon within 7 days
     */

    static async getExpiringSoon(userId, days = 7) {
        const result = await db.query(
            `SELECT * FROM pantry_items 
            WHERE user_id = $1 
            AND expiry_date IS NOT NULL
            AND expiry_date <= CURRENT_DATE + INTERVAL '${days} days'
            AND expiry_date >= CURRENT_DATE
            ORDER BY expiry_date ASC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * 
     * Get Pantry Items by ID
     */

    static async findById(id, userId) {
        const result = await db.query(
            `SELECT * FROM pantry_items 
            WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0];
    }

    /**
     * 
     * Update Pantry Item
     */
    static async update(id, userId, itemData) {
        const { name, quantity, unit, category, expiry_date, is_running_low } = itemData;

        const result = await db.query(
            `UPDATE pantry_items 
            SET name = COALESCE($1, name), 
            quantity = COALESCE($2, quantity), 
            unit = COALESCE($3, unit),
            category = COALESCE($4, category),
            expiry_date = COALESCE($5, expiry_date),
            is_running_low = COALESCE($6, is_running_low)
            WHERE id = $7 AND user_id = $8
            RETURNING *`,  
            [name, quantity, unit, category, expiry_date, is_running_low, id, userId]
        );
        return result.rows[0];
    }

    /**
     * 
     * Delete Pantry Item
     */
    static async delete(id, userId) {
        const result = await db.query(
            `DELETE FROM pantry_items 
            WHERE id = $1 AND user_id = $2
            RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }

    /**
     * 
     *Get Pantry stats
     */
    static async getStats(userId) {
        const result = await db.query(
            `SELECT COUNT(*) as total_items,
            COUNT(DISTINCT category) as total_categories,
            COUNT(*) filter(WHERE is_running_low = true) as running_low_items,          
            COUNT(*) filter(WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE) as expiring_soon_items
            FROM pantry_items 
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }
};


export default PantryItem;




