const { pool } = require('../config/database');

async function checkDatabase() {
    try {
        // ดูชื่อตารางทั้งหมดในฐานข้อมูล
        const [tables] = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables
            WHERE table_schema = 'inextbroadbandstock'
        `);
        
        console.log('Tables in database:');
        tables.forEach(table => {
            console.log(table.TABLE_NAME);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDatabase();