import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import exportRouter from './routes/export.js';
import adminRouter from './routes/admin.js';
import storiesRouter from './routes/stories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', exportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stories', storiesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
