import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Find the built assets in dist
const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('dist folder not found. Run npm run build first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const assetsDir = path.join(distDir, 'assets');
const assetFiles = fs.readdirSync(assetsDir);
const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('CSS or JS file not found in dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

console.log(`Embedding frontend assets:`);
console.log(`- index.html (${indexHtml.length} bytes)`);
console.log(`- ${cssFile} (${cssContent.length} bytes)`);
console.log(`- ${jsFile} (${jsContent.length} bytes)`);

// 2. Generate src/desktop-app.ts
const desktopAppCode = `// ResolveLUT Studio - Windows 11 Native Desktop Application
// Self-contained .exe with embedded frontend, Administrator UAC, and DaVinci Resolve Studio integration
import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const PORT = 3824;
const WIN_RESOLVE_EXE = 'C:\\\\Program Files\\\\Blackmagic Design\\\\DaVinci Resolve\\\\Resolve.exe';
const WIN_RESOLVE_LUT_DIR = 'C:\\\\ProgramData\\\\Blackmagic Design\\\\DaVinci Resolve\\\\Support\\\\LUT\\\\ResolveLUT_Studio';

// Embedded Frontend Assets
const EMBEDDED_HTML = ${JSON.stringify(indexHtml)};
const EMBEDDED_CSS = ${JSON.stringify(cssContent)};
const EMBEDDED_JS = ${JSON.stringify(jsContent)};
const CSS_FILENAME = ${JSON.stringify('/assets/' + cssFile)};
const JS_FILENAME = ${JSON.stringify('/assets/' + jsFile)};

function isAdministrator(): boolean {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function elevateProcess() {
  const exePath = process.execPath;
  console.log('[!] Solicitare permisiuni de Administrator Windows 11 (UAC)...');
  try {
    const psCmd = \`powershell -Command "Start-Process -FilePath '\${exePath}' -Verb RunAs"\`;
    execSync(psCmd, { stdio: 'ignore' });
  } catch (err) {
    console.error('Elevare refuzata sau anulata de utilizator.');
  }
  process.exit(0);
}

function launchNativeAppWindow(url: string) {
  console.log('[+] Se deschide fereastra nativa a aplicatiei ResolveLUT Studio...');
  // Try Microsoft Edge App Mode (native on Windows 11)
  const edgeCommands = [
    \`start "" msedge.exe --app="\${url}" --window-size=1440,920 --window-position=50,50\`,
    \`start "" chrome.exe --app="\${url}" --window-size=1440,920\`,
    \`start "\${url}"\`,
  ];

  for (const cmd of edgeCommands) {
    try {
      execSync(cmd, { stdio: 'ignore' });
      return;
    } catch {
      // try next
    }
  }
}

// Create embedded HTTP Server
const server = http.createServer((req, res) => {
  const url = req.url || '/';

  // API: Status
  if (url === '/api/windows/status') {
    const resolveInstalled = fs.existsSync(WIN_RESOLVE_EXE);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      platform: 'win32',
      isWindows: true,
      isAdmin: isAdministrator(),
      resolveExePath: WIN_RESOLVE_EXE,
      resolveLutPath: WIN_RESOLVE_LUT_DIR,
      resolveInstalled,
      message: 'ResolveLUT Studio ruleaza ca Aplicatie Nativa Desktop .exe pe Windows 11!',
    }));
  }

  // API: Launch Resolve as Administrator
  if (url === '/api/windows/launch-resolve' && req.method === 'POST') {
    try {
      execSync(\`powershell -Command "Start-Process '\${WIN_RESOLVE_EXE}' -Verb RunAs"\`, { stdio: 'ignore' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'DaVinci Resolve Studio a fost lansat cu drepturi de Administrator!' }));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  // API: Install LUTs into Resolve
  if (url === '/api/windows/install-luts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { luts } = JSON.parse(body || '{}');
        if (!fs.existsSync(WIN_RESOLVE_LUT_DIR)) {
          fs.mkdirSync(WIN_RESOLVE_LUT_DIR, { recursive: true });
        }
        let written = 0;
        if (Array.isArray(luts)) {
          for (const item of luts) {
            const sanitized = item.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            fs.writeFileSync(path.join(WIN_RESOLVE_LUT_DIR, sanitized), item.content, 'utf8');
            written++;
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          installedCount: written,
          targetDir: WIN_RESOLVE_LUT_DIR,
          message: \`Au fost instalate \${written} LUT-uri in DaVinci Resolve Studio!\`,
        }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static Assets
  if (url === CSS_FILENAME) {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(EMBEDDED_CSS);
  }

  if (url === JS_FILENAME) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(EMBEDDED_JS);
  }

  // SPA Fallback: HTML
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(EMBEDDED_HTML);
});

function main() {
  console.clear();
  console.log('========================================================================');
  console.log('   ResolveLUT Studio - Aplicatie Desktop Nativa Windows 11 (.exe)');
  console.log('   Color Grading Suite pentru DaVinci Resolve Studio');
  console.log('========================================================================\\n');

  if (!isAdministrator()) {
    console.log('[!] Solicitare drepturi de Administrator Windows 11...');
    elevateProcess();
    return;
  }

  console.log('[✓] Rulare cu drepturi de Administrator confirmata!');

  // Start local application server
  server.listen(PORT, '127.0.0.1', () => {
    const appUrl = \`http://127.0.0.1:\${PORT}\`;
    console.log(\`[+] Serverul intern ResolveLUT Studio a pornit la: \${appUrl}\`);
    console.log('[+] Se deschide fereastra aplicatiei...');
    launchNativeAppWindow(appUrl);
    console.log('\\n[i] Aplicatia ruleaza. Apasati Ctrl+C in acest terminal pentru a opri aplicatia.');
  });
}

main();
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/desktop-app.ts'), desktopAppCode, 'utf8');
console.log('src/desktop-app.ts generated successfully.');

// 3. Compile standalone .exe using Bun
console.log('Compiling standalone Windows .exe: public/ResolveLUTStudio.exe ...');
execSync('bun build --compile --target=bun-windows-x64 --outfile=public/ResolveLUTStudio.exe ./src/desktop-app.ts', {
  stdio: 'inherit',
});

// Also copy to dist and public/ResolveLUTStudio_Win11_Admin.exe
fs.copyFileSync('public/ResolveLUTStudio.exe', 'dist/ResolveLUTStudio.exe');
fs.copyFileSync('public/ResolveLUTStudio.exe', 'public/ResolveLUTStudio_Win11_Admin.exe');
fs.copyFileSync('public/ResolveLUTStudio.exe', 'dist/ResolveLUTStudio_Win11_Admin.exe');

console.log('\n[SUCCESS] Standalone Windows 11 Desktop Application .exe created!');
console.log('File location: public/ResolveLUTStudio.exe');
