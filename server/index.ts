import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.ts';
import bidsRouter from './routes/bids.ts';
import watchlistRouter from './routes/watchlist.ts';

const app = express();
const PORT = process.env.PORT ?? 3001;

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/watchlist', watchlistRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
