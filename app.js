const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Debug middleware with more details
app.use((req, res, next) => {
    console.log('Request received:');
    console.log(`- Time: ${new Date().toISOString()}`);
    console.log(`- Method: ${req.method}`);
    console.log(`- URL: ${req.url}`);
    console.log(`- Headers:`, req.headers);
    next();
});

const equipmentFirebaseRouter = require('./routes/equipment-firebase');
app.use('/api/equipment-firebase', equipmentFirebaseRouter);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// เพิ่ม error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Test the API at: http://localhost:${port}/api/equipment-firebase`);
});
