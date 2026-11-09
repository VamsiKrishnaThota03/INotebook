require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('Missing required environment variable JWT_SECRET. Copy backend/.env.example to backend/.env and fill it in.');
  process.exit(1);
}

module.exports = {
  jwtSecret,
  port: Number(process.env.PORT) || 5000,
  // Loopback by default. Set HOST=0.0.0.0 only on a hosting platform (e.g. Render) that requires it.
  host: process.env.HOST || '127.0.0.1',
  // Local, credential-free default for development.
  mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inotebookDb',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
