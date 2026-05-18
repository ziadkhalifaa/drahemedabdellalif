const path = require('path');
const fs = require('fs');
const http = require('http');

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';

console.log('--- Process Info ---');
console.log('Node Version:', process.version);
console.log('Memory Usage:', process.memoryUsage());
console.log('ENV PORT:', process.env.PORT);
console.log('RUN_API:', process.env.RUN_API);
console.log('--------------------');

const standaloneServerPath = path.join(__dirname, 'apps/web/.next/standalone/server.js');
const apiServerPath = path.join(__dirname, 'apps/api/dist/main.js');

// If this is the API slot or the frontend files don't exist
if (process.env.RUN_API === 'true' || !fs.existsSync(standaloneServerPath)) {
  console.log('🚀 Starting Standalone NestJS API Server...');
  console.log('Path:', apiServerPath);

  if (fs.existsSync(apiServerPath)) {
    try {
      require(apiServerPath);
      console.log('✅ Standalone NestJS API server loaded successfully.');
    } catch (err) {
      console.error('💥 Failed to require NestJS server:', err);
      process.exit(1);
    }
  } else {
    console.error('❌ NestJS build not found. Did `npm run deploy:api` complete successfully?');
    console.error('Expected path:', apiServerPath);

    http.createServer((req, res) => {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('API Server build output not found. Check compilation logs.');
    }).listen(process.env.PORT);
  }
} else {
  // Start Standalone Next.js Frontend Server
  console.log('🚀 Starting Standalone Next.js Server...');
  console.log('Path:', standaloneServerPath);

  try {
    const standaloneDir = path.join(__dirname, 'apps/web/.next/standalone');
    process.chdir(standaloneDir);

    if (!fs.existsSync(path.join(standaloneDir, 'node_modules'))) {
      console.warn('⚠️ Warning: node_modules not found in standalone directory!');
    }

    require(path.join(standaloneDir, 'server.js'));
    console.log('✅ Standalone Next.js server loaded successfully.');
  } catch (err) {
    console.error('💥 Failed to require Next.js standalone server:', err);
    process.exit(1);
  }
}

