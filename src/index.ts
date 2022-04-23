import cors from 'cors';
import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3005; // default port to listen

app.use(cors());
app.use(express.json());

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello api' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello world' });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

module.exports = app;
