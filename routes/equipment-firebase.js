const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { collection, getDocs, query, where } = require('firebase/firestore');

// Test route
router.get('/', (req, res) => {
    console.log('Firebase route accessed');
    res.json({ message: 'Firebase route is working' });
});

// Products route
router.get('/products', async (req, res) => {
    try {
        console.log('Fetching products...');
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log(`Found ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add new route for filtering by sheet_name
router.get('/sheet/:name', async (req, res) => {
    try {
        const sheetName = req.params.name;
        console.log(`Fetching products for sheet: ${sheetName}`);
        
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('sheet_name', '==', sheetName));
        const snapshot = await getDocs(q);
        
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ดึงข้อมูลทั้งหมด
router.get('/equipment', async (req, res) => {
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ดึงข้อมูลตาม sheet_name
router.get('/equipment/sheet/:name', async (req, res) => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('sheet_name', '==', req.params.name));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ดึงข้อมูลสรุป
router.get('/equipment/summary', async (req, res) => {
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        
        // จัดกลุ่มข้อมูลตาม sheet_name
        const groupedData = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!groupedData[data.sheet_name]) {
                groupedData[data.sheet_name] = [];
            }
            groupedData[data.sheet_name].push({
                model: data.model,
                total: 1,
                borrowed: data.borrower_id ? 1 : 0
            });
        });

        // รวมจำนวนตาม model ในแต่ละ sheet_name
        Object.keys(groupedData).forEach(sheet => {
            const models = {};
            groupedData[sheet].forEach(item => {
                if (!models[item.model]) {
                    models[item.model] = {
                        model: item.model,
                        total: 0,
                        borrowed: 0
                    };
                }
                models[item.model].total += item.total;
                models[item.model].borrowed += item.borrowed;
            });
            groupedData[sheet] = Object.values(models);
        });

        res.json(groupedData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ดึงข้อมูลสถิติ
router.get('/stats', async (req, res) => {
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const products = snapshot.docs.map(doc => doc.data());

        const stats = {
            totalAll: products.length,
            borrowedAll: products.filter(p => p.borrower_id).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// เพิ่ม route สำหรับดูรายละเอียดตาม model
router.get('/equipment/model/:modelName', async (req, res) => {
    try {
        const modelName = req.params.modelName;
        console.log(`Fetching details for model: ${modelName}`);

        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('model', '==', modelName));
        const snapshot = await getDocs(q);

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (products.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลอุปกรณ์' });
        }

        res.json(products);
    } catch (error) {
        console.error('Error fetching model details:', error);
        res.status(500).json({ error: error.message });
    }
});

// เพิ่ม route สำหรับการยืม
router.post('/equipment/borrow', async (req, res) => {
    try {
        const { serial_number, borrower_id, borrower_name, borrow_date, return_date } = req.body;
        // โค้ดสำหรับการยืม
        res.json({ message: 'บันทึกการยืมสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// เพิ่ม route สำหรับการคืน
router.post('/equipment/return', async (req, res) => {
    try {
        const { serial_number } = req.body;
        // โค้ดสำหรับการคืน
        res.json({ message: 'บันทึกการคืนสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;