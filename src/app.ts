import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import pixRoutes from './routes/pixRoutes';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/api/util', pixRoutes);
app.use('/api/pix', pixRoutes);

export default app;
