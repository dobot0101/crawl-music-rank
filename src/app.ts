// src/app.ts
import express, { Application, Request, Response } from 'express';
import musicChartRouter from './routes/musicChart';
import logger from './logger';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.send('hello world');
});

app.use('/music-chart', musicChartRouter);

app.listen(9999, () => {
  logger.info(`서버 실행중`);
});
