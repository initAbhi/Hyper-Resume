import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const nestCliBin = path.join(backendRoot, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');

const extraArgs = process.argv.slice(2);
const nestArgs = [nestCliBin, 'start', '--watch', ...extraArgs];

let childExited = false;
let isCleaningUp = false;

const child = spawn(process.execPath, nestArgs, {
  cwd: backendRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEST_DEV_WATCH: '1',
    NEST_DEV_WATCH_PID: String(process.pid),
  },
});

function killChildTree() {
  if (childExited || !child.pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // Ignore errors if process already terminated
  }
}

function shutdown(exitCode = 0) {
  if (isCleaningUp) return;
  isCleaningUp = true;
  killChildTree();
  process.exit(exitCode);
}

child.on('exit', (code, signal) => {
  childExited = true;
  if (!isCleaningUp) {
    process.exit(signal ? 0 : (code ?? 0));
  }
});

for (const sig of ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP']) {
  process.on(sig, () => shutdown(0));
}

process.on('exit', () => {
  killChildTree();
});
