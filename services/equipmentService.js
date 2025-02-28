import { db } from '../config/firebase.js';

export const equipmentService = {
    async getSummary() {
        try {
            const snapshot = await db.collection('equipment').get();
            const data = {};
            
            snapshot.forEach(doc => {
                const item = doc.data();
                if (!data[item.category]) {
                    data[item.category] = [];
                }
                
                // Group by model
                const modelIndex = data[item.category].findIndex(m => m.model === item.model);
                if (modelIndex === -1) {
                    data[item.category].push({
                        model: item.model,
                        total: 1,
                        borrowed: item.borrower_id ? 1 : 0
                    });
                } else {
                    data[item.category][modelIndex].total++;
                    if (item.borrower_id) {
                        data[item.category][modelIndex].borrowed++;
                    }
                }
            });
            
            return data;
        } catch (error) {
            console.error('Error getting summary:', error);
            throw error;
        }
    },

    async getModelDetails(modelName) {
        try {
            const snapshot = await db.collection('equipment')
                .where('model', '==', modelName)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting model details:', error);
            throw error;
        }
    },

    async borrowEquipment(formData) {
        try {
            const docRef = await db.collection('equipment')
                .where('serial_number', '==', formData.serial_number)
                .get();

            if (docRef.empty) {
                throw new Error('ไม่พบอุปกรณ์นี้');
            }

            await docRef.docs[0].ref.update({
                borrower_id: formData.borrower_id,
                borrower_name: formData.borrower_name,
                borrow_date: formData.borrow_date,
                return_date: formData.return_date
            });

            return { success: true };
        } catch (error) {
            console.error('Error borrowing equipment:', error);
            throw error;
        }
    },

    async returnEquipment(serialNumber) {
        try {
            const docRef = await db.collection('equipment')
                .where('serial_number', '==', serialNumber)
                .get();

            if (docRef.empty) {
                throw new Error('ไม่พบอุปกรณ์นี้');
            }

            await docRef.docs[0].ref.update({
                borrower_id: null,
                borrower_name: null,
                borrow_date: null,
                return_date: null
            });

            return { success: true };
        } catch (error) {
            console.error('Error returning equipment:', error);
            throw error;
        }
    }
};
