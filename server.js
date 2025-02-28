const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Firebase routes
const equipmentFirebaseRouter = require('./routes/equipment-firebase');
app.use('/api', equipmentFirebaseRouter);

// Root route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>iNEXT Stock System</title>
            <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="/stylefirst.css">
        </head>
        <body>
            <header>
                <h1>iNEXT Stock Management System</h1>
            </header>
            <main class="main">
                <!-- ช่องค้นหาหลัก -->
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="ค้นหาอุปกรณ์...">
                </div>
                <div id="stockStats" class="stats-container"></div>
                <div class="category-grid"></div>
            </main>

            <!-- Detail Modal -->
            <div id="detailModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2 id="modalTitle"></h2>
                    <!-- ลบช่องค้นหาออกจากตรงนี้ -->
                    <div id="modalContent"></div>
                </div>
            </div>

            <!-- Borrow Modal -->
            <div id="borrowModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>ยืมอุปกรณ์</h2>
                    <form id="borrowForm">
                        <div class="form-group">
                            <label for="serialNumber">Serial Number:</label>
                            <input type="text" id="serialNumber" readonly>
                        </div>
                        <div class="form-group">
                            <label for="borrowerId">รหัสผู้ยืม:</label>
                            <input type="text" id="borrowerId" required>
                        </div>
                        <div class="form-group">
                            <label for="borrowerName">ชื่อผู้ยืม:</label>
                            <input type="text" id="borrowerName" required>
                        </div>
                        <div class="form-group">
                            <label for="borrowDate">วันที่ยืม:</label>
                            <input type="date" id="borrowDate" required>
                        </div>
                        <div class="form-group">
                            <label for="returnDate">กำหนดคืน:</label>
                            <input type="date" id="returnDate" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="submit-btn">ยืนยัน</button>
                            <button type="button" class="cancel-btn" onclick="document.getElementById('borrowModal').style.display='none'">ยกเลิก</button>
                        </div>
                    </form>
                </div>
            </div>

            <script src="/scriptfirst.js"></script>
        </body>
        </html>
    `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});