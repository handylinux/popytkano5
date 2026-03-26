const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Expo web server...');

const expo = spawn('npm', ['run', 'web'], {
  cwd: path.dirname(__filename),
  stdio: 'inherit',
  shell: true
});

expo.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
