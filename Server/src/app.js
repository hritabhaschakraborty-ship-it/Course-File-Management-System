const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Initialize express middlewares
app.use(cors());
app.use(express.json());

// Serving virtual directory for uploads if they upload actual files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Ensure uploads folder exists
const fs = require('fs');
if (!fs.existsSync(uploadsPath)){
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Status check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CFMS Server is healthy and running.' });
});

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const facultyRoutes = require('./routes/faculty');
const reviewerRoutes = require('./routes/reviewer');
const notificationsRoutes = require('./routes/notifications');
const studentRoutes = require('./routes/student');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/student', studentRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
