import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({});
});

const port = getEnvironmentVariable('PORT') || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
