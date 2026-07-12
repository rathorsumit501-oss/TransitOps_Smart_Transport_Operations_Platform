import 'dotenv/config'; // Load env variables immediately before importing Prisma or app configs
import app from './src/app.js';

// Define listening port
const PORT = process.env.PORT || 5000;

// Start server listening
const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`TransitOps API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`========================================`);
});

// Handle unhandled Promise rejections globally
process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down server...');
  console.error(error.name, error.message);
  if (error.stack) console.error(error.stack);

  // Close the server and exit gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down server...');
  console.error(error.name, error.message);
  if (error.stack) console.error(error.stack);

  // Uncaught exceptions need immediate exit to prevent memory leaks or undefined states
  process.exit(1);
});
