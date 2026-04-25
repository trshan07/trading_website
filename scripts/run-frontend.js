const path = require('path');
const { spawn } = require('child_process');
const { loadRootEnv } = require('./rootEnv');

loadRootEnv();

const frontendDir = path.resolve(__dirname, '..', 'frontend');
const scriptName = process.argv[2] || 'start';
const executable =
  process.platform === 'win32' ? 'cmd.exe' : path.join(frontendDir, 'node_modules', '.bin', 'react-scripts');
const args =
  process.platform === 'win32'
    ? ['/c', 'react-scripts.cmd', scriptName, ...process.argv.slice(3)]
    : [scriptName, ...process.argv.slice(3)];

const child = spawn(executable, args, {
  cwd: frontendDir,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(`Failed to start frontend with root .env: ${error.message}`);
  process.exit(1);
});
