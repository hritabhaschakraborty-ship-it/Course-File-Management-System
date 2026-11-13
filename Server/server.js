const app = require('./src/app');
const { db, databaseReady } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

databaseReady.then(() => {
  const server = app.listen(PORT, () => {
    console.log(`CFMS Backend Server running on port ${PORT}`);
  });

  process.on('SIGINT', () => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      server.close(() => {
        console.log('Server shut down.');
        process.exit(0);
      });
    });
  });
}).catch((error) => {
  console.error('Unable to initialize the CFMS database:', error);
  process.exitCode = 1;
});
