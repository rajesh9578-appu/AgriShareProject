// Frees the backend port before starting, so "EADDRINUSE" never blocks `npm run dev`.
try { require('dotenv').config(); } catch (e) { /* dotenv optional here */ }
const { execSync } = require('child_process');

const port = parseInt(process.env.PORT, 10) || 5000;
const isWin = process.platform === 'win32';

try {
  let pids = [];
  if (isWin) {
    const out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    out.split(/\r?\n/).forEach((line) => {
      const cols = line.trim().split(/\s+/);
      // Proto Local Foreign State PID
      if (cols[3] === 'LISTENING' && cols[1] && cols[1].endsWith(`:${port}`)) pids.push(cols[4]);
    });
  } else {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN || true`, { encoding: 'utf8' });
    pids = out.split(/\s+/).filter(Boolean);
  }

  pids = [...new Set(pids)].filter((pid) => pid && pid !== '0' && pid !== String(process.pid));
  pids.forEach((pid) => {
    try {
      execSync(isWin ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`[freePort] Stopped old process ${pid} that was using port ${port}`);
    } catch (e) {
      console.log(`[freePort] Could not stop process ${pid}: ${e.message}`);
    }
  });
  if (!pids.length) console.log(`[freePort] Port ${port} is free`);
} catch (e) {
  console.log(`[freePort] Skipped: ${e.message}`);
}
