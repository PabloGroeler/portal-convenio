const fs = require('fs');
const path = require('path');

// Simple generator: reads project .env and writes frontend/config.js with window.__API_BASE__
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const frontendConfigPath = path.join(projectRoot, 'frontend', 'config.js');

function parseEnv(envText) {
  const lines = envText.split(/\r?\n/);
  const obj = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.substring(0, idx).trim();
    const v = trimmed.substring(idx + 1).trim();
    obj[k] = v;
  }
  return obj;
}

try {
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found at', envPath);
    process.exit(1);
  }
  const envText = fs.readFileSync(envPath, 'utf8');
  const env = parseEnv(envText);
  const apiBase = env.API_BASE || '/api';
  const content = `window.__API_BASE__ = '${apiBase.replace(/\\"/g, '\\\\"')}';\n`;
  fs.writeFileSync(frontendConfigPath, content, 'utf8');
  console.log('Wrote', frontendConfigPath, 'with API base', apiBase);
} catch (err) {
  console.error('Error generating config.js:', err);
  process.exit(1);
}

