const path = require('path');
const { spawn } = require('child_process');
const { loadRootEnv } = require('./rootEnv');

loadRootEnv();

const backendDir = path.resolve(__dirname, '..', 'backend');
const mode = process.argv[2] || 'dev';

const isWindows = process.platform === 'win32';
const executable =
  mode === 'start'
    ? process.execPath
    : isWindows
      ? 'cmd.exe'
      : path.join(backendDir, 'node_modules', '.bin', 'nodemon');

const args =
  mode === 'start'
    ? ['server.js']
    : isWindows
      ? ['/c', 'nodemon.cmd', 'server.js', ...process.argv.slice(3)]
      : ['server.js', ...process.argv.slice(3)];

const child = spawn(executable, args, {
  cwd: backendDir,
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
  console.error(`Failed to start backend with root .env: ${error.message}`);
  process.exit(1);
});
