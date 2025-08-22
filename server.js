import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json, urlencoded } from 'express';
import { ensureDatabaseSetup } from './src/db.js';
import authRouter from './src/routes/auth.js';

const app = express();
const port = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(json());
app.use(urlencoded({ extended: false }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);

ensureDatabaseSetup()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


