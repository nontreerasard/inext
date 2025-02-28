const { pool } = require('../config/database');

async function checkTables() {
    try {
        // ดูชื่อตารางทั้งหมด
        const [tables] = await pool.query('SHOW TABLES');
        console.log('Available tables:', tables);

        // ดูโครงสร้างของแต่ละตาราง
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            console.log(`\nTable: ${tableName}`);
            console.log('Columns:', columns);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();