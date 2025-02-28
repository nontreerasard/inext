const { pool, db } = require('../config/database');
const { collection, addDoc } = require('firebase/firestore');

async function migrateData() {
    try {
        // ดึงข้อมูลจากตาราง products
        const [rows] = await pool.query('SELECT * FROM products');
        
        // สร้าง collection ชื่อ products ใน Firestore
        const collectionRef = collection(db, 'products');
        
        let migratedCount = 0;
        for (const row of rows) {
            await addDoc(collectionRef, {
                id: row.id,
                model: row.model,
                serial_number: row.serial_number,
                borrower_id: row.borrower_id || null,
                borrower_name: row.borrower_name || null,
                borrow_date: row.borrow_date ? new Date(row.borrow_date) : null,
                return_date: row.return_date ? new Date(row.return_date) : null,
                status: row.status,
                sheet_name: row.sheet_name,
                created_at: new Date(),
                updated_at: new Date()
            });
            migratedCount++;
            console.log(`Migrated ${migratedCount}/${rows.length} records`);
        }
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData();