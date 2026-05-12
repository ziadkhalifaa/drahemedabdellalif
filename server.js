const path = require('path');
const fs = require('fs');

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
console.log('--------------------');

const standaloneServerPath = path.join(__dirname, 'apps/web/.next/standalone/server.js');

if (fs.existsSync(standaloneServerPath)) {
  console.log('🚀 Starting Standalone Next.js Server...');
  console.log('Path:', standaloneServerPath);
  console.log('Current Dir:', __dirname);

  try {
    const standaloneDir = path.join(__dirname, 'apps/web/.next/standalone');
    process.chdir(standaloneDir);

    // Check if node_modules exists in standalone
    if (!fs.existsSync(path.join(standaloneDir, 'node_modules'))) {
      console.warn('⚠️ Warning: node_modules not found in standalone directory!');
    }

    require(path.join(standaloneDir, 'server.js'));
    console.log('✅ Standalone Next.js server loaded from:', path.join(standaloneDir, 'server.js'));
  } catch (err) {
    console.error('💥 Failed to require standalone server:', err);
    process.exit(1);
  }
} else {
  console.error('❌ Build output not found. Did `npm run build` complete successfully?');
  console.error('Expected path:', standaloneServerPath);

  // Fallback for Hostinger: bind to port anyway to avoid 503 while we debug
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Server initialization in progress or failed. Check logs.');
  }).listen(process.env.PORT);
}
