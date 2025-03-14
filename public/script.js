import {
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    getDoc,
    setDoc,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Content Loaded");

    if (window.db) {
        console.log("Firebase is available");
        loadEquipmentSummary();
        setupSearch();
    } else {
        console.error("Firebase is not initialized!");
        alert("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้");
    }
});

window.viewModelDetails = viewModelDetails;
window.borrowEquipment = borrowEquipment;
window.returnEquipment = returnEquipment;
window.closeBorrowModal = function () {
    const modal = document.getElementById('borrowModal');
    if (modal) {
        document.getElementById('borrowForm').reset();
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
};

async function loadEquipmentSummary() {
    try {
        console.log("Starting loadEquipmentSummary...");
        console.log("window.db:", window.db);

        const productsRef = collection(window.db, 'products');
        const querySnapshot = await getDocs(productsRef);

        console.log("Query snapshot:", querySnapshot.size);

        if (querySnapshot.empty) {
            console.log("No documents found");
            return;
        }

        const data = {};

        querySnapshot.forEach(doc => {
            const item = doc.data();
            console.log("Document data:", item);

            const category = 'รายชื่ออุปกรณ์';
            const model = item.model;

            if (!model) {
                console.warn("Skipping item - missing model:", item);
                return;
            }

            if (!data[category]) {
                data[category] = [];
            }

            const modelIndex = data[category].findIndex(m => m.model === model);
            if (modelIndex === -1) {
                data[category].push({
                    model: model,
                    total: 1,
                    borrowed: item.borrower_id ? 1 : 0
                });
            } else {
                data[category][modelIndex].total++;
                if (item.borrower_id) {
                    data[category][modelIndex].borrowed++;
                }
            }
        });

        console.log("Processed data:", data);

        if (Object.keys(data).length === 0) {
            console.warn("No data processed!");
            return;
        }

        displaySummary(data);
    } catch (error) {
        console.error('Error in loadEquipmentSummary:', error);
        alert('ไม่สามารถโหลดข้อมูลได้: ' + error.message);
    }
}

function displaySummary(data) {
    console.log("DisplaySummary called with data:", data);
    const container = document.querySelector('.category-grid');
    console.log("Container element:", container);
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    const html = Object.entries(data).map(([sheetName, models]) => `
        <div class="category-card">
            <h2 class="category-title">${sheetName}</h2>
            <div class="model-list">
                ${models.map(model => `
                    <div class="model-item">
                        <div class="model-stats-container">
                            <div class="model-name">${model.model}</div>
                            <div>ทั้งหมด: ${model.total}</div>
                            <div>ถูกยืม: ${model.borrowed}</div>
                            <div>
                                <button class="view-details-btn" onclick="viewModelDetails('${model.model}')">
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();

        const modelItems = document.getElementsByClassName('model-item');
        Array.from(modelItems).forEach(item => {
            const modelName = item.querySelector('.model-name').textContent.toLowerCase();
            const shouldShow = modelName.includes(searchTerm);
            item.style.display = shouldShow ? '' : 'none';

            const parentCard = item.closest('.category-card');
            if (parentCard) {
                const hasVisibleItems = Array.from(parentCard.getElementsByClassName('model-item'))
                    .some(item => item.style.display !== 'none');
                parentCard.style.display = hasVisibleItems ? '' : 'none';
            }
        });
    });
}

async function viewModelDetails(modelName) {
    try {
        // ใช้ Firebase v9 syntax
        const productsRef = collection(window.db, 'products');
        const q = query(productsRef, where('model', '==', modelName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No devices found for model:", modelName);
            return;
        }

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        const modalHTML = `
            <div class="modal-search">
                <input type="text" id="detailSearchInput" placeholder="ค้นหา Serial Number, ผู้ยืม...">
            </div>
            ${createTableHTML(data)}
        `;

        modalTitle.textContent = `รายละเอียด ${modelName}`;
        modalContent.innerHTML = modalHTML;
        modal.style.display = 'block';
        document.body.classList.add('modal-open');

        const searchInput = document.getElementById('detailSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                const searchTerm = e.target.value.toLowerCase().trim();
                const rows = document.querySelectorAll('.detail-row');
                let hasResults = false;

                rows.forEach(row => {
                    const searchableText = [
                        row.cells[0].textContent,
                        row.cells[2].textContent,
                        row.cells[3].textContent,
                        row.cells[4].textContent 
                    ].join(' ').toLowerCase();

                    if (searchableText.includes(searchTerm)) {
                        row.style.display = '';
                        hasResults = true;
                    } else {
                        row.style.display = 'none';
                    }
                });

                const tbody = modal.querySelector('.details-table tbody');
                const existingNoResults = tbody.querySelector('.no-results');

                if (!hasResults) {
                    if (!existingNoResults) {
                        const noResultsRow = document.createElement('tr');
                        noResultsRow.className = 'no-results';
                        noResultsRow.innerHTML = `
                            <td colspan="6" style="text-align: center; padding: 1rem;">
                                ไม่พบผลการค้นหา
                            </td>
                        `;
                        tbody.appendChild(noResultsRow);
                    }
                } else if (existingNoResults) {
                    existingNoResults.remove();
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถโหลดรายละเอียดได้');
    }
}

function createTableHTML(data) {
    return `
        <div class="details-table-container">
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Serial Number</th>
                        <th>สถานะ</th>
                        <th>รหัสผู้ยืม</th>
                        <th>ชื่อผู้ยืม</th>
                        <th>วันที่ยืม</th>
                        <th>กำหนดคืน</th>
                        <th>การดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr class="detail-row">
                            <td>${item.serial_number || '-'}</td>
                            <td>${item.borrower_id ? 'ถูกยืม' : 'ว่าง'}</td>
                            <td>${item.borrower_id || '-'}</td>
                            <td>${item.borrower_name || '-'}</td>
                            <td>${item.borrow_date ? new Date(item.borrow_date).toLocaleDateString('th-TH') : '-'}</td>
                            <td>${item.return_date ? new Date(item.return_date).toLocaleDateString('th-TH') : '-'}</td>
                            <td>${item.borrower_id
            ? `<button class="return-btn" onclick="returnEquipment('${item.serial_number}')">คืน</button>`
            : `<button class="borrow-btn" onclick="borrowEquipment('${item.serial_number}')">ยืม</button>`
        }</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function borrowEquipment(serialNumber) {
    try {

        const borrowModal = document.getElementById('borrowModal');
        document.getElementById('serialNumber').value = serialNumber;
        borrowModal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'เกิดข้อผิดพลาดในการยืมอุปกรณ์');
    }
}

async function returnEquipment(serialNumber) {
    try {

        const productsRef = collection(window.db, 'products');
        const q = query(productsRef, where('serial_number', '==', serialNumber));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error('ไม่พบอุปกรณ์นี้');
        }

        const docRef = doc(window.db, 'products', snapshot.docs[0].id);
        await updateDoc(docRef, {
            borrower_id: null,
            borrower_name: null,
            borrow_date: null,
            return_date: null
        });

        alert('คืนอุปกรณ์สำเร็จ');

        loadEquipmentSummary();
        const modelName = document.getElementById('modalTitle').textContent.replace('รายละเอียด ', '');
        viewModelDetails(modelName);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'เกิดข้อผิดพลาดในการคืนอุปกรณ์');
    }
}

document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
        const formData = {
            serial_number: document.getElementById('serialNumber').value,
            borrower_id: document.getElementById('borrowerId').value,
            borrower_name: document.getElementById('borrowerName').value,
            borrow_date: document.getElementById('borrowDate').value,
            return_date: document.getElementById('returnDate').value
        };

        if (!formData.borrower_id || !formData.borrower_name || !formData.borrow_date || !formData.return_date) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        const borrowDate = new Date(formData.borrow_date);
        const returnDate = new Date(formData.return_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (borrowDate < today) {
            throw new Error('วันที่ยืมต้องไม่เป็นวันที่ผ่านมาแล้ว');
        }

        if (returnDate <= borrowDate) {
            throw new Error('วันที่คืนต้องมากกว่าวันที่ยืม');
        }

        const productsRef = collection(window.db, 'products');
        const q = query(productsRef, where('serial_number', '==', formData.serial_number));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error('ไม่พบอุปกรณ์นี้');
        }

        const docRef = doc(window.db, 'products', snapshot.docs[0].id);
        await updateDoc(docRef, {
            borrower_id: formData.borrower_id,
            borrower_name: formData.borrower_name,
            borrow_date: formData.borrow_date,
            return_date: formData.return_date
        });

        alert('ยืมอุปกรณ์สำเร็จ');
        document.getElementById('borrowModal').style.display = 'none';
        document.body.classList.remove('modal-open');

        loadEquipmentSummary();

        const detailModal = document.getElementById('detailModal');
        if (detailModal.style.display === 'block') {
            const modelName = document.getElementById('modalTitle').textContent.replace('รายละเอียด ', '');
            viewModelDetails(modelName);
        }

    } catch (error) {
        alert(error.message || 'เกิดข้อผิดพลาดในการยืมอุปกรณ์');
    }
});

// Reset form when closing modal
document.querySelector('#borrowModal .close')?.addEventListener('click', function () {
    document.getElementById('borrowForm').reset();
    document.getElementById('borrowModal').style.display = 'none';
    document.body.classList.remove('modal-open');
});

// Cancel button handler
document.querySelector('#borrowModal .cancel-btn')?.addEventListener('click', function () {
    document.getElementById('borrowForm').reset();
    document.getElementById('borrowModal').style.display = 'none';
    document.body.classList.remove('modal-open');
});

// Helper Functions

// Close modal handlers
document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = function () {
        this.closest('.modal').style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});

window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}