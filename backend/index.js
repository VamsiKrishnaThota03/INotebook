const mongoose = require('mongoose');
const { port, host } = require('./config');
const connectToMongo = require('./db');
const { createApp } = require('./app');

connectToMongo()
  .then(() => {
    const server = createApp().listen(port, host, () => {
      console.log(`iNotebook backend listening at http://${host}:${port}`);
    });

    // Drain in-flight requests and close the Mongo connection when the
    // platform replaces the container, so a deploy does not surface as 502s or
    // leaked connections.
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
        } catch {
          // Already closed; nothing useful to do here.
        }
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
