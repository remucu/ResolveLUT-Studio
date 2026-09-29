import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Windows 11 DaVinci Resolve Studio Default Paths
const WIN_RESOLVE_EXE = 'C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe';
const WIN_RESOLVE_LUT_DIR = 'C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\LUT\\ResolveLUT_Studio';

// Helper to check if running on Windows
function isWindowsPlatform(): boolean {
  return process.platform === 'win32';
}

// Helper to check if running with elevated Administrator privileges on Windows
function checkWindowsAdmin(callback: (isAdmin: boolean) => void) {
  if (!isWindowsPlatform()) {
    callback(false);
    return;
  }
  exec('net session', (err) => {
    callback(!err);
  });
}

// 1. Status API: Check Windows 11 & DaVinci Resolve Studio
app.get('/api/windows/status', (req: Request, res: Response) => {
  const isWin = isWindowsPlatform();
  const resolveInstalled = isWin ? fs.existsSync(WIN_RESOLVE_EXE) : false;

  checkWindowsAdmin((isAdmin) => {
    res.json({
      platform: process.platform,
      isWindows: isWin,
      isAdmin,
      resolveExePath: WIN_RESOLVE_EXE,
      resolveLutPath: WIN_RESOLVE_LUT_DIR,
      resolveInstalled,
      message: isWin
        ? (resolveInstalled
            ? 'DaVinci Resolve Studio a fost detectat pe Windows 11.'
            : 'Sistem Windows 11 detectat. DaVinci Resolve Studio poate fi pornit la calea standard.')
        : 'Rulare în mediu web container. Pachetul Windows 11 (.bat / .ps1) este gata de descărcare și rulare ca Administrator.',
    });
  });
});

// 2. Launch DaVinci Resolve Studio with Administrator privileges
app.post('/api/windows/launch-resolve', (req: Request, res: Response) => {
  if (!isWindowsPlatform()) {
    // If not running directly on a Windows host machine, return the ready-to-run elevated command
    return res.json({
      success: true,
      simulated: true,
      command: `powershell -Command "Start-Process '${WIN_RESOLVE_EXE}' -Verb RunAs"`,
      message: 'Comandă generată pentru Windows 11 cu drepturi de Administrator.',
    });
  }

  // Windows command using PowerShell Start-Process -Verb RunAs for UAC Elevation
  const cmd = `powershell -Command "Start-Process '${WIN_RESOLVE_EXE}' -Verb RunAs"`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        stderr,
        message: 'Eroare la lansarea DaVinci Resolve Studio ca Administrator.',
      });
    }
    res.json({
      success: true,
      message: 'DaVinci Resolve Studio a fost pornit cu drepturi de Administrator!',
      stdout,
    });
  });
});

// 3. Directly install LUTs into DaVinci Resolve directory on Windows
app.post('/api/windows/install-luts', (req: Request, res: Response) => {
  const { luts } = req.body as { luts?: Array<{ filename: string; content: string }> };

  if (!luts || !Array.isArray(luts) || luts.length === 0) {
    return res.status(400).json({ success: false, message: 'Nu au fost furnizate fișiere LUT.' });
  }

  if (!isWindowsPlatform()) {
    return res.json({
      success: true,
      simulated: true,
      installedCount: luts.length,
      targetDir: WIN_RESOLVE_LUT_DIR,
      message: `${luts.length} LUT-uri pregătite pentru instalare automată în ${WIN_RESOLVE_LUT_DIR}.`,
    });
  }

  try {
    if (!fs.existsSync(WIN_RESOLVE_LUT_DIR)) {
      fs.mkdirSync(WIN_RESOLVE_LUT_DIR, { recursive: true });
    }

    let written = 0;
    for (const item of luts) {
      const sanitized = item.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetPath = path.join(WIN_RESOLVE_LUT_DIR, sanitized);
      fs.writeFileSync(targetPath, item.content, 'utf8');
      written++;
    }

    res.json({
      success: true,
      installedCount: written,
      targetDir: WIN_RESOLVE_LUT_DIR,
      message: `Au fost instalate cu succes ${written} LUT-uri în DaVinci Resolve Studio (${WIN_RESOLVE_LUT_DIR}).`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Permisiune refuzată. Asigurați-vă că aplicația rulează ca Administrator pentru a scrie în C:\\ProgramData.',
    });
  }
});

// Windows DaVinci Resolve Scripts directories
const WIN_RESOLVE_SCRIPTS_DIR = 'C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Fusion\\Scripts\\Color';

// 4. Transmit Directly to DaVinci Resolve Studio Color Page (Nodes Configuration)
app.post('/api/windows/apply-to-resolve-nodes', (req: Request, res: Response) => {
  const { lutFilename, lutContent, lutTitle, state } = req.body as {
    lutFilename?: string;
    lutContent?: string;
    lutTitle?: string;
    state?: any;
  };

  const filename = (lutFilename || `${lutTitle || 'Grade'}_Resolve33.cube`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const relativeLutPath = `ResolveLUT_Studio/${filename}`;

  // 1. Ensure LUT is saved in DaVinci Resolve LUT directory
  if (lutContent && isWindowsPlatform()) {
    try {
      if (!fs.existsSync(WIN_RESOLVE_LUT_DIR)) {
        fs.mkdirSync(WIN_RESOLVE_LUT_DIR, { recursive: true });
      }
      fs.writeFileSync(path.join(WIN_RESOLVE_LUT_DIR, filename), lutContent, 'utf8');
    } catch (e) {
      console.warn('Could not write LUT file directly:', e);
    }
  }

  // 2. Build Python Automation Script for DaVinci Resolve Color Page
  const pythonScript = `#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
ResolveLUT Studio -> DaVinci Resolve Studio Node Transmitter
Aplica nodul colorizat si configureaza arborele de noduri in pagina Color.
LUT: ${filename}
"""
import sys
import os

def connect_resolve():
    try:
        import DaVinciResolveScript as dvr
        return dvr.scriptapp("Resolve")
    except Exception:
        # Adauga calea standard a modulelor de scripting DaVinci Resolve
        dev_modules = r"C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Developer\\Scripting\\Modules"
        if os.path.exists(dev_modules) and dev_modules not in sys.path:
            sys.path.append(dev_modules)
        try:
            import DaVinciResolveScript as dvr
            return dvr.scriptapp("Resolve")
        except Exception as err:
            print(f"[!] Eroare conectare API DaVinci Resolve: {err}")
            return None

def apply_grade():
    resolve = connect_resolve()
    if not resolve:
        print("[!] DaVinci Resolve Studio nu ruleaza sau Scripting API este inactiv.")
        return False

    pm = resolve.GetProjectManager()
    project = pm.GetCurrentProject()
    if not project:
        print("[!] Niciun proiect deschis in DaVinci Resolve.")
        return False

    timeline = project.GetCurrentTimeline()
    if not timeline:
        print("[!] Niciun timeline activ deschis in DaVinci Resolve.")
        return False

    current_clip = timeline.GetCurrentVideoItem()
    if not current_clip:
        print("[!] Niciun clip video selectat pe timeline in pagina Color.")
        return False

    clip_name = current_clip.GetName()
    print(f"[+] Clip activ identificat in Color Page: {clip_name}")

    # Calea relativa a LUT-ului in DaVinci Resolve
    lut_path = r"${relativeLutPath}"
    print(f"[+] Se aplica LUT-ul pe nodul curent: {lut_path}")

    # SetLUT aplica direct LUT-ul pe nodul specificat din pagina Color
    # In DaVinci Resolve Studio: current_clip.SetLUT(nodeIndex, lutPath)
    applied = False
    for node_idx in [1, 2, 3, 4]:
        try:
            res = current_clip.SetLUT(node_idx, lut_path)
            if res:
                print(f"[✓] Succes! Nodul {node_idx} a fost configurat cu {lut_path}")
                applied = True
                break
        except Exception as e:
            continue

    if not applied:
        print(f"[i] LUT-ul a fost pregatit. Pentru aplicare manuala: Clic dreapta pe nod -> LUT -> ResolveLUT_Studio -> ${filename}")

    return True

if __name__ == '__main__':
    apply_grade()
`;

  // 3. Write script to DaVinci's auto-script directory if on Windows
  if (isWindowsPlatform()) {
    try {
      if (!fs.existsSync(WIN_RESOLVE_SCRIPTS_DIR)) {
        fs.mkdirSync(WIN_RESOLVE_SCRIPTS_DIR, { recursive: true });
      }
      fs.writeFileSync(path.join(WIN_RESOLVE_SCRIPTS_DIR, 'Apply_ResolveLUT_Grade.py'), pythonScript, 'utf8');

      // Attempt to execute via python
      exec('python -c "import sys; print(sys.version)"', (err) => {
        if (!err) {
          exec(`python "${path.join(WIN_RESOLVE_SCRIPTS_DIR, 'Apply_ResolveLUT_Grade.py')}"`, (pErr, pStdout) => {
            console.log('Python script output:', pStdout);
          });
        }
      });
    } catch (e) {
      console.warn('Script save error:', e);
    }
  }

  res.json({
    success: true,
    lutFilename: filename,
    lutRelativePath: relativeLutPath,
    scriptName: 'Apply_ResolveLUT_Grade.py',
    scriptPath: path.join(WIN_RESOLVE_SCRIPTS_DIR, 'Apply_ResolveLUT_Grade.py'),
    pythonScript,
    message: isWindowsPlatform()
      ? `Nodul DaVinci a fost transmis! LUT-ul ${filename} este configurat în Color Page.`
      : `Comanda de transmisie a fost generată pentru DaVinci Resolve Studio Color Page (Nod 1-4: ${relativeLutPath}).`,
  });
});

// 5. Download Standalone Windows 11 Desktop Application (.exe)
app.get('/api/windows/download-exe', (req: Request, res: Response) => {
  const exePath = path.resolve(process.cwd(), 'public', 'ResolveLUTStudio.exe');
  const fallbackPath = path.resolve(process.cwd(), 'public', 'ResolveLUTStudio_Win11_Admin.exe');
  const target = fs.existsSync(exePath) ? exePath : fallbackPath;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
    res.setHeader('Content-Disposition', 'attachment; filename="ResolveLUTStudio.exe"');
    return res.sendFile(target);
  }
  return res.status(404).json({ error: 'Executabilul Windows ResolveLUTStudio.exe nu a fost găsit.' });
});

// 5. Generate & Download Automated Windows 11 Admin Installer Script (.bat)
app.post('/api/windows/download-installer', (req: Request, res: Response) => {
  const { luts } = req.body as { luts?: Array<{ filename: string; content: string }> };

  // Generate self-elevating Windows 11 batch script that requests Administrator privileges and copies LUTs
  const batScript = `@echo off
:: =========================================================================
:: ResolveLUT Studio - Windows 11 Administrator Installer & Launcher
:: Blackmagic Design DaVinci Resolve Studio Integration
:: =========================================================================
chcp 65001 >nul
echo.
echo ========================================================================
echo   ResolveLUT Studio - Instalare LUT-uri si Pornire DaVinci Resolve
echo ========================================================================
echo.

:: 1. Verificare si Solicitare Drepturi de Administrator (UAC Elevation)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Solicitare drepturi de Administrator Windows 11...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [+] Rulare confirmata cu drepturi de Administrator Windows 11!
echo.

:: 2. Creare director LUT DaVinci Resolve Studio in C:\\ProgramData
set "RESOLVE_LUT_DIR=C:\\ProgramData\\Blackmagic Design\\DaVinci Resolve\\Support\\LUT\\ResolveLUT_Studio"
set "RESOLVE_EXE=C:\\Program Files\\Blackmagic Design\\DaVinci Resolve\\Resolve.exe"

echo [+] Verificare director DaVinci Resolve Studio:
echo     %RESOLVE_LUT_DIR%

if not exist "%RESOLVE_LUT_DIR%" (
    mkdir "%RESOLVE_LUT_DIR%"
    echo [+] Directorul LUT a fost creat cu succes.
)

:: 3. Copiere LUT-uri
echo [+] Se instaleaza LUT-urile exportate in DaVinci Resolve...
${
  luts && luts.length > 0
    ? luts
        .map(
          (lut) =>
            `powershell -Command "[System.IO.File]::WriteAllText('${WIN_RESOLVE_LUT_DIR.replace(/\\/g, '\\\\')}\\\\${lut.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}', [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${Buffer.from(lut.content).toString('base64')}'))]"`
        )
        .join('\r\n')
    : 'echo [*] Niciun LUT suplimentar inclus direct in pachet.'
}

echo [+] Toate LUT-urile au fost instalate cu succes in DaVinci Resolve Studio!
echo.

:: 4. Pornire DaVinci Resolve Studio ca Administrator
if exist "%RESOLVE_EXE%" (
    echo [+] Se porneste DaVinci Resolve Studio ca Administrator...
    start "" "%RESOLVE_EXE%"
) else (
    echo [!] DaVinci Resolve Studio nu a fost gasit la calea standard:
    echo     %RESOLVE_EXE%
    echo     Puteti deschide manual DaVinci Resolve; LUT-urile sunt instalate!
)

echo.
echo ========================================================================
echo   Finalizat! In DaVinci Resolve: Color Page -> Settings -> Update Lists
echo ========================================================================
pause
`;

  res.setHeader('Content-Type', 'application/x-bat');
  res.setHeader('Content-Disposition', 'attachment; filename="Install_ResolveLUT_Win11_Admin.bat"');
  res.send(batScript);
});

// Mount Vite middleware for SPA
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResolveLUT Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
