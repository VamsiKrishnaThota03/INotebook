const express = require('express');
const cors = require('cors');
const { port, host, corsOrigins } = require('./config');
const connectToMongo = require('./db');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '100kb' }));

// Available Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

connectToMongo()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`iNotebook backend listening at http://${host}:${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
