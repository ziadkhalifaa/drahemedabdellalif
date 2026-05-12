const path = require('path');
const fs = require('fs');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';

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

    require('./server.js');
    console.log('✅ Standalone server.js required successfully');
  } catch (err) {
    console.error('💥 Failed to require standalone server:', err);
    process.exit(1);
  }
} else {
  console.error('❌ Standalone server not found at:', standaloneServerPath);
  console.error('Please ensure the build command finished successfully and scripts/copy-assets.mjs ran.');
  
  // Fallback for Hostinger: bind to port anyway to avoid 503 while we debug
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Server initialization in progress or failed. Check logs.');
  }).listen(process.env.PORT);
}
