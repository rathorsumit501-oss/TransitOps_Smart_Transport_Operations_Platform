import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import { NotFoundError } from './utils/errorHandler.js';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Body parser, parsing JSON request bodies
app.use(express.json());

// URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

// Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TransitOps API Server is operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);

// Fallback: 404 handler for unmatched routes
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Cannot find endpoint "${req.originalUrl}" on this server.`));
});

// Mount global error response handler
app.use(errorMiddleware);

export default app;
