const { execSync } = require('child_process');
const path = require('path');

const projectPath = '/vercel/share/v0-project';

try {
  console.log('Installing dependencies...');
  execSync('npm install', {
    cwd: projectPath,
    stdio: 'inherit'
  });

  console.log('\nStarting Expo web server...');
  execSync('npm run web', {
    cwd: projectPath,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
