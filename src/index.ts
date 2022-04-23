import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import apiV1 from './routes/api/v1';

config();

const app = express();
const port = process.env.PORT || 3005; // default port to listen

app.use(cors());
app.use(express.json());

app.use('/api/v1', apiV1);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

module.exports = app;
