const { exec } = require('child_process');

console.log('Starting Expo web server...');

const expo = exec('cd /vercel/share/v0-project && npm run web', {
  stdio: 'inherit'
});

expo.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
